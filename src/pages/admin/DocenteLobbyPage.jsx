import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Layers, Search, LogOut, Info, Users, UserCheck, GraduationCap, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ModalConfirmation from '../../components/ModalConfirmation';
import GlyphSearchBar from '../../components/admin/GlyphSearchBar';
import FilterTabs from '../../components/admin/FilterTabs';
import Pagination from '../../components/admin/Pagination';
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

  //Carga de datos generales
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

  //Carga de detalles del grupo seleccionado
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

      //Carga de activaciones del grupo
      const groupConfig = await db.grupo_escolar_grupo_nivel
        .where('grupo_escolar_id')
        .equals(Number(selectedGroup.id) || selectedGroup.local_id)
        .toArray();

      const configMap = {};
      groupConfig.forEach(c => {
        configMap[c.grupo_nivel_id] = c.activo;
      });
      setGroupBlockActivations(configMap);

      //Carga de activaciones individuales
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

  //Activación de bloque a nivel GRUPAL
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

  const getDifficultyColor = (diff) => {
    switch (diff?.toUpperCase()) {
      case 'BASICO':
      case 'BÁSICO':
        return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' };
      case 'INTERMEDIO':
        return { bg: 'bg-amber-50 text-amber-600 border-amber-500/80', dot: 'bg-amber-500' };
      case 'AVANZADO':
        return { bg: 'bg-rose-50 text-rose-500 border-rose-200', dot: 'bg-rose-500' };
      default:
        return { bg: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-500' };
    }
  };

  return (
    <div className="min-h-screen bg-maya-cream pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white px-4 py-4 sm:px-6 sm:py-6 rounded-b-[2.5rem] sm:rounded-b-[3rem] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between border-gray-50 border-b z-50">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-maya-gold p-1 bg-white shadow-sm shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-maya-orange-light flex items-center justify-center text-maya-gold font-black text-lg uppercase">
              {docenteName.charAt(0)}
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-maya-dark font-black text-sm sm:text-base leading-tight truncate max-w-[120px] sm:max-w-[180px]">{docenteName}</h2>
            <span className="text-maya-gold font-bold text-xs tracking-wide">Docente Autorizado</span>
          </div>
        </div>

        <button 
          onClick={() => setShowLogoutModal(true)}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-maya-orange-light text-[11px] sm:text-sm text-maya-gold font-bold hover:bg-maya-orange-light transition-all active:scale-95 shadow-sm whitespace-nowrap"
        >
          Cerrar sesión
        </button>
      </div>

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
                    {paginatedBlocks.map(block => {
                      const blockGlyphs = glyphs.filter(glyph => Number(glyph.grupo_id) === Number(block.id));
                      const diffStyle = getDifficultyColor(block.dificultad);
                      
                      const isActivo = groupBlockActivations[block.id] !== undefined 
                        ? groupBlockActivations[block.id] 
                        : (block.activo !== false);

                      return (
                        <div 
                          key={block.id} 
                          className="bg-white rounded-4xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4 transition-transform hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex gap-4 items-center select-none flex-1 min-w-0">
                            <div 
                              className="w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-xs"
                              style={{ backgroundColor: block.color || '#10B981' }}
                            >
                              <Layers className="w-8 h-8 text-white/95" strokeWidth={2.5} />
                            </div>

                            <div className="flex flex-col flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-black text-maya-dark text-base leading-tight truncate">
                                  {block.nombre}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-widest shrink-0 flex items-center gap-1 ${diffStyle.bg}`}>
                                  <span className={`w-1 h-1 rounded-full ${diffStyle.dot}`}></span>
                                  {block.dificultad || 'BÁSICO'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-bold truncate mb-2 pr-2">
                                {block.descripcion || 'Sin descripción asignada.'}
                              </p>
                              <div>
                                <span className="bg-slate-50 text-slate-500 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-slate-200/60 tracking-wider">
                                  {blockGlyphs.length} {blockGlyphs.length === 1 ? 'GLIFO' : 'GLIFOS'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Interruptor Grupal 3D */}
                          <div className="flex flex-col items-center gap-1.5 shrink-0 pl-2 border-l border-slate-100">
                            <button
                              onClick={() => handleToggleGroupBlock(block)}
                              className={`w-14 h-8 rounded-full p-1 transition-all duration-300 outline-none flex items-center relative ${
                                isActivo 
                                  ? 'bg-[#01805E] shadow-inner shadow-green-950/20' 
                                  : 'bg-slate-200'
                              }`}
                            >
                              <div 
                                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center font-bold text-[9px] ${
                                  isActivo ? 'translate-x-6 text-[#01805E]' : 'translate-x-0 text-slate-400'
                                }`}
                              >
                                {isActivo ? 'SÍ' : 'NO'}
                              </div>
                            </button>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              {isActivo ? 'ACTIVO' : 'OCULTO'}
                            </span>
                          </div>
                        </div>
                      );
                    })}

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
                    {paginatedStudents.map(student => {
                      const initials = student.nombre.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();

                      return (
                        <div 
                          key={student.local_id || student.id}
                          className="bg-white rounded-4xl p-3 sm:p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4 transition-transform hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex gap-4 items-center min-w-0">
                            {/* Avatar Alumno con gradiente */}
                            <div 
                              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-maya-gold font-black text-lg shadow-inner"
                              style={{ background: 'linear-gradient(135deg, rgba(1,128,94,0.06), rgba(225,77,75,0.04))' }}
                            >
                              {initials || 'U'}
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-black text-maya-dark text-[15px] sm:text-base leading-tight truncate">
                                {student.nombre} {student.apellido || ''}
                              </h3>
                              <p className="text-xs text-slate-400 font-bold truncate mt-0.5">
                                {student.username} • {student.grado}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenStudentConfig(student)}
                            className="px-4 py-2 bg-maya-gold text-white text-[9px] font-black rounded-full shadow-md shadow-amber-900/10 hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-1.5 shrink-0"
                          >
                            AJUSTES
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

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

      {/* MODAL DE PERSONALIZACIÓN DEL ALUMNO */}
      {isStudentModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-maya-cream rounded-[40px] p-6 w-full max-w-lg shadow-2xl flex flex-col relative border-4 border-maya-gold/20 h-[80vh] my-8">
            <button 
              onClick={() => { setIsStudentModalOpen(false); setSelectedStudent(null); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/50 text-maya-dark hover:bg-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-4 pr-10">
              <h2 className="text-2xl font-black text-maya-dark uppercase tracking-tight truncate">
                Restringir: {selectedStudent.nombre}
              </h2>
              <p className="text-[10px] text-maya-gold font-bold tracking-widest uppercase">
                Ajustes individuales de bloques
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 text-[11px] leading-relaxed">
                <Info className="w-5 h-5 shrink-0 text-amber-500" />
                <p>
                  Por defecto, los alumnos heredan la configuración del grupo. Puedes sobrescribirla para este alumno específico usando los botones.
                </p>
              </div>

              {blocks.map(block => {
                const blockId = Number(block.id);
                
                const isGroupActivo = groupBlockActivations[blockId] !== undefined 
                  ? groupBlockActivations[blockId] 
                  : (block.activo !== false);

                const customActivo = studentBlockActivations[selectedStudent.id]?.[blockId];
                const hasOverride = customActivo !== undefined;

                return (
                  <div 
                    key={block.id}
                    className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col gap-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-black text-maya-dark text-sm leading-tight">{block.nombre}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          Estado grupal: <span className={`font-black ${isGroupActivo ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isGroupActivo ? 'ACTIVO' : 'OCULTO'}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStudentBlock(selectedStudent, block, true)}
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${
                            hasOverride && customActivo === true 
                              ? 'bg-[#01805E] border-[#01805E] text-white shadow-xs' 
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          Habilitar
                        </button>
                        <button
                          onClick={() => handleToggleStudentBlock(selectedStudent, block, false)}
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${
                            hasOverride && customActivo === false 
                              ? 'bg-[#E14D4B] border-[#E14D4B] text-white shadow-xs' 
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          Ocultar
                        </button>
                      </div>
                    </div>

                    {hasOverride && (
                      <div className="flex items-center justify-between border-t border-dashed border-slate-100 pt-2 text-[10px]">
                        <span className="text-amber-600 font-black flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Personalizado ({customActivo ? 'Habilitado' : 'Oculto'})
                        </span>
                        <button
                          onClick={() => handleClearStudentOverride(selectedStudent, block)}
                          className="text-slate-400 hover:text-slate-600 underline font-black uppercase tracking-wider text-[9px]"
                        >
                          Heredar del grupo
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
