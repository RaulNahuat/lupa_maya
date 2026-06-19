import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Users, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ModalConfirmation from '../../components/ModalConfirmation';
import GlyphSearchBar from '../../components/admin/GlyphSearchBar';
import Pagination from '../../components/admin/Pagination';
import TeacherHeader from '../../components/admin/TeacherHeader';
import TeacherBlockCard from '../../components/admin/TeacherBlockCard';
import TeacherStudentCard from '../../components/admin/TeacherStudentCard';
import StudentBlockConfigModal from '../../components/admin/StudentBlockConfigModal';
import { db } from '../../data/db';
import { procesarColaSincronizacion } from '../../services/syncService';

const DocenteLobbyPage = () => {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useAuth();
  const { showToast } = useToast();

  const [assignedGroups, setAssignedGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [glyphs, setGlyphs] = useState([]);
  const [students, setStudents] = useState([]);

  const [groupBlockActivations, setGroupBlockActivations] = useState({}); 
  const [studentBlockActivations, setStudentBlockActivations] = useState({}); 

  const [activeSubTab, setActiveSubTab] = useState('BLOQUES');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const blocksPerPage = 10;
  const docenteName = currentUser?.nombre || 'Docente';

  // Carga de datos generales
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [groupsData, blocksData, glyphsData, allUsers] = await Promise.all([
        db.grupos_escolares.where('docente_id').equals(Number(currentUser.id)).toArray(),
        db.grupos_niveles.toArray(),
        db.glifos.toArray(),
        db.usuarios.toArray()
      ]);

      setAssignedGroups(groupsData);
      setBlocks(blocksData.sort((a, b) => (a.numero_grupo || 0) - (b.numero_grupo || 0)));
      setGlyphs(glyphsData);
      setStudents(allUsers.filter(u => Number(u.rol_id) === 2));

      if (groupsData.length > 0) {
        setSelectedGroup(groupsData[0]);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error al obtener datos iniciales del docente:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser]);

  // Carga de detalles del grupo seleccionado
  const loadGroupDetails = async () => {
    if (!selectedGroup) return;
    setIsLoading(true);
    try {
      const groupIdVal = selectedGroup.id || selectedGroup.local_id;

      // Cargar alumnos inscritos
      const studentsData = await db.usuarios
        .where('grupo_escolar_id')
        .equals(groupIdVal)
        .toArray();

      setGroupStudents(studentsData);

      // Carga de activaciones del grupo
      const groupConfig = await db.grupo_escolar_grupo_nivel
        .where('grupo_escolar_id')
        .equals(Number(selectedGroup.id) || selectedGroup.local_id)
        .toArray();

      const configMap = {};
      groupConfig.forEach(c => {
        configMap[c.grupo_nivel_id] = c.activo;
      });
      setGroupBlockActivations(configMap);

      // Carga de activaciones individuales
      const studentConfig = await db.usuario_grupo_nivel.toArray();

      const studentConfigMap = {};
      studentConfig.forEach(c => {
        if (!studentConfigMap[c.usuario_id]) {
          studentConfigMap[c.usuario_id] = {};
        }
        studentConfigMap[c.usuario_id][c.grupo_nivel_id] = c.activo;
      });
      setStudentBlockActivations(studentConfigMap);

    } catch (error) {
      console.error("Error al cargar detalles del grupo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      loadGroupDetails();
    }
  }, [selectedGroup]);

  // Activación de bloque a nivel GRUPAL
  const handleToggleGroupBlock = async (block) => {
    if (!selectedGroup) return;

    const blockId = Number(block.id);
    const groupId = Number(selectedGroup.id) || selectedGroup.local_id;
    
    const estadoActual = groupBlockActivations[blockId] !== undefined 
      ? groupBlockActivations[blockId] 
      : (block.activo !== false);

    const nuevoEstado = !estadoActual;

    try {
      const record = {
        grupo_escolar_id: groupId,
        grupo_nivel_id: blockId,
        activo: nuevoEstado
      };

      await db.transaction('rw', db.grupo_escolar_grupo_nivel, db.cola_sincronizacion, async () => {
        const localRecord = await db.grupo_escolar_grupo_nivel
          .where('[grupo_escolar_id+grupo_nivel_id]')
          .equals([groupId, blockId])
          .first();

        if (localRecord) {
          await db.grupo_escolar_grupo_nivel.update(localRecord.id, { activo: nuevoEstado });
        } else {
          await db.grupo_escolar_grupo_nivel.add(record);
        }

        await db.cola_sincronizacion.add({
          entidad: 'grupo_escolar_grupo_nivel',
          accion: 'UPSERT',
          datos: record,
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setGroupBlockActivations(prev => ({
        ...prev,
        [blockId]: nuevoEstado
      }));

      showToast(
        nuevoEstado ? 'Bloque Habilitado' : 'Bloque Ocultado',
        `El bloque "${block.nombre}" ahora está ${nuevoEstado ? 'activo' : 'oculto'} para el grupo ${selectedGroup.nombre}.`,
        'success'
      );

      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error(error);
      showToast('Error', 'No se pudo guardar la configuración.', 'error');
    }
  };

  // Manejo de activación de bloque a nivel INDIVIDUAL
  const handleToggleStudentBlock = async (student, block, nuevoEstado) => {
    const studentId = Number(student.id);
    const blockId = Number(block.id);

    try {
      const record = {
        usuario_id: studentId,
        grupo_nivel_id: blockId,
        activo: nuevoEstado
      };

      await db.transaction('rw', db.usuario_grupo_nivel, db.cola_sincronizacion, async () => {
        const localRecord = await db.usuario_grupo_nivel
          .where('[usuario_id+grupo_nivel_id]')
          .equals([studentId, blockId])
          .first();

        if (localRecord) {
          await db.usuario_grupo_nivel.update(localRecord.id, { activo: nuevoEstado });
        } else {
          await db.usuario_grupo_nivel.add(record);
        }

        await db.cola_sincronizacion.add({
          entidad: 'usuario_grupo_nivel',
          accion: 'UPSERT',
          datos: record,
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setStudentBlockActivations(prev => {
        const studentMap = prev[studentId] ? { ...prev[studentId] } : {};
        studentMap[blockId] = nuevoEstado;
        return {
          ...prev,
          [studentId]: studentMap
        };
      });

      showToast('Personalización Guardada', `Configuración para ${student.nombre} actualizada.`, 'success');
      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error(error);
      showToast('Error', 'No se pudo guardar la configuración individual.', 'error');
    }
  };

  const handleClearStudentOverride = async (student, block) => {
    const studentId = Number(student.id);
    const blockId = Number(block.id);

    try {
      await db.transaction('rw', db.usuario_grupo_nivel, db.cola_sincronizacion, async () => {
        await db.usuario_grupo_nivel
          .where('[usuario_id+grupo_nivel_id]')
          .equals([studentId, blockId])
          .delete();

        await db.cola_sincronizacion.add({
          entidad: 'usuario_grupo_nivel',
          accion: 'ELIMINAR',
          datos: { usuario_id: studentId, grupo_nivel_id: blockId },
          estado: 'PENDIENTE',
          created_at: new Date().getTime()
        });
      });

      setStudentBlockActivations(prev => {
        const studentMap = prev[studentId] ? { ...prev[studentId] } : {};
        delete studentMap[blockId];
        return {
          ...prev,
          [studentId]: studentMap
        };
      });

      showToast('Restaurado', `El alumno ahora heredará la configuración del grupo.`, 'info');
      if (navigator.onLine) procesarColaSincronizacion();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenStudentConfig = (student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  // Filtrado de bloques/alumnos por búsqueda
  const filteredBlocks = blocks.filter(block => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return block.nombre.toLowerCase().includes(query) || (block.descripcion || '').toLowerCase().includes(query);
  });

  const filteredStudents = groupStudents.filter(student => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${student.nombre} ${student.apellido || ''}`.toLowerCase();
    return fullName.includes(query) || student.username.toLowerCase().includes(query);
  });

  const totalPages = Math.max(1, Math.ceil(
    (activeSubTab === 'BLOQUES' ? filteredBlocks.length : filteredStudents.length) / blocksPerPage
  ));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * blocksPerPage;
  
  const paginatedBlocks = filteredBlocks.slice(startIndex, startIndex + blocksPerPage);
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + blocksPerPage);

  return (
    <div className="min-h-screen bg-maya-cream pb-16">
      {/* Header */}
      <TeacherHeader 
        docenteName={docenteName} 
        onLogoutClick={() => setShowLogoutModal(true)} 
      />

      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
        
        {/* Banner Informativo Premium */}
        <div className="relative overflow-hidden bg-linear-to-br from-white to-maya-cream/40 rounded-3xl p-5 border border-maya-gold/20 shadow-xs">
          <div className="absolute top-[-30%] right-[-10%] w-36 h-36 bg-maya-gold/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-maya-gold/15 flex items-center justify-center text-maya-gold shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-maya-dark tracking-tight uppercase">
                Control de Bloques de Glifos
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Habilita o deshabilita bloques de niveles para tu grupo entero, o personaliza el acceso a estudiantes específicos desde la pestaña de alumnos.
              </p>
            </div>
          </div>
        </div>

        {/* Selector de Grupo */}
        <div className="bg-white rounded-4xl p-5 shadow-sm border border-gray-100">
          <label className="text-[10px] font-black text-maya-dark/60 uppercase tracking-widest block mb-2">Grupo Escolar a Gestionar</label>
          {assignedGroups.length > 0 ? (
            <select
              value={selectedGroup?.local_id || selectedGroup?.id || ''}
              onChange={(e) => {
                const grp = assignedGroups.find(g => (g.local_id || g.id) === e.target.value);
                setSelectedGroup(grp);
                setCurrentPage(1);
              }}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-maya-gold outline-none font-bold text-maya-dark cursor-pointer text-sm transition-all"
            >
              {assignedGroups.map(g => (
                <option key={g.local_id || g.id} value={g.local_id || g.id}>
                  {g.nombre} ({students.filter(s => s.grupo_escolar_id === (g.id || g.local_id)).length} Alumnos)
                </option>
              ))}
            </select>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex gap-3 text-amber-800 text-xs">
              <Info className="w-5 h-5 shrink-0" />
              <p className="font-bold">No tienes grupos asignados por el administrador aún.</p>
            </div>
          )}
        </div>

        {selectedGroup && (
          <>
            {/* Tabs de Sub-Gestión */}
            <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-2xl">
              <button
                onClick={() => { setActiveSubTab('BLOQUES'); setCurrentPage(1); }}
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  activeSubTab === 'BLOQUES' 
                    ? 'bg-white text-maya-dark shadow-xs' 
                    : 'text-slate-400 hover:text-maya-dark'
                }`}
                type="button"
              >
                <Layers className="w-4.5 h-4.5" />
                Bloques del Grupo
              </button>
              <button
                onClick={() => { setActiveSubTab('ALUMNOS'); setCurrentPage(1); }}
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  activeSubTab === 'ALUMNOS' 
                    ? 'bg-white text-maya-dark shadow-xs' 
                    : 'text-slate-400 hover:text-maya-dark'
                }`}
                type="button"
              >
                <Users className="w-4.5 h-4.5" />
                Alumnos ({groupStudents.length})
              </button>
            </div>

            {/* Buscador */}
            <div className="space-y-3">
              <GlyphSearchBar onSearch={setSearchQuery} />
            </div>

            {/* Catálogo de Bloques */}
            {activeSubTab === 'BLOQUES' && (
              <div className="space-y-3.5">
                {isLoading ? (
                  <div className="text-center py-16 opacity-40">
                    <span className="font-bold uppercase tracking-widest animate-pulse text-xs text-maya-dark">Cargando bloques...</span>
                  </div>
                ) : paginatedBlocks.length > 0 ? (
                  <>
                    {paginatedBlocks.map(block => (
                      <TeacherBlockCard
                        key={block.id}
                        block={block}
                        glyphs={glyphs}
                        groupBlockActivations={groupBlockActivations}
                        onToggleGroupBlock={handleToggleGroupBlock}
                      />
                    ))}

                    <Pagination
                      currentPage={safeCurrentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                ) : (
                  <div className="text-center py-10 opacity-30">
                    <span className="font-bold uppercase tracking-widest text-xs">Sin bloques encontrados</span>
                  </div>
                )}
              </div>
            )}

            {/* Listado de Alumnos */}
            {activeSubTab === 'ALUMNOS' && (
              <div className="space-y-3.5">
                {paginatedStudents.length > 0 ? (
                  <>
                    {paginatedStudents.map(student => (
                      <TeacherStudentCard
                        key={student.local_id || student.id}
                        student={student}
                        onConfigure={handleOpenStudentConfig}
                      />
                    ))}

                    <Pagination
                      currentPage={safeCurrentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                ) : (
                  <div className="text-center py-10 opacity-30">
                    <span className="font-bold uppercase tracking-widest text-xs">No hay alumnos inscritos</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <StudentBlockConfigModal
        isOpen={isStudentModalOpen}
        onClose={() => { setIsStudentModalOpen(false); setSelectedStudent(null); }}
        student={selectedStudent}
        blocks={blocks}
        groupBlockActivations={groupBlockActivations}
        studentBlockActivations={studentBlockActivations}
        onToggleStudentBlock={handleToggleStudentBlock}
        onClearStudentOverride={handleClearStudentOverride}
      />

      {/* CONFIRMACIÓN DE CERRAR SESIÓN */}
      <ModalConfirmation 
        isOpen={showLogoutModal}
        title="¿Salir de la cuenta?"
        message="Tendrás que volver a ingresar tus credenciales para gestionar el mapa."
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={() => {
          logoutUser();
          navigate('/login');
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default DocenteLobbyPage;
