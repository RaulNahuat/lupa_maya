export const levels = [
  {
    id: 1,
    type: "quiz",
    unlocked: true,
    completed: false,

    glyph: {
      id: 101,
      name: "K'in",
      meaning: "Sol",
      image: "/assets/glyphs/kin.png",
      audio: "/assets/audio/kin.mp3",
    },

    content: {
      question: "¿Qué crees que significa este glifo?",
      options: ["Sol", "Luna", "Agua", "Jaguar"],
      correctAnswer: "Sol",
    },
  },

  {
    id: 2,
    type: "scan",
    unlocked: false,
    completed: false,

    glyph: {
      id: 102,
      name: "Uh",
      meaning: "Luna",
      image: "/assets/glyphs/uh.png",
      audio: "/assets/audio/uh.mp3",
    },

    content: {
      instruction: "Escanea el glifo de la Luna",
    },
  },

  {
    id: 3,
    type: "quiz",
    unlocked: false,
    completed: false,

    glyph: {
      id: 103,
      name: "Báalam",
      meaning: "Sol",
      image: "/assets/glyphs/baalam.png",
      audio: "/assets/audio/baalam.mp3",
    },

    content: {
      question: "¿Qué crees que significa este glifo?",
      options: ["Rana", "Jaguar", "Jirafa", "Iguana"],
      correctAnswer: "Jaguar",
    },
  },

  {
    id: 4,
    type: "scan",
    unlocked: false,
    completed: false,

    glyph: {
      id: 104,
      name: "Paal",
      meaning: "Niño",
      image: "/assets/glyphs/paal.png",
      audio: "/assets/audio/paal.mp3",
    },

    content: {
      instruction: "Escanea el glifo del niño",
    },
  },
]