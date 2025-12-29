/* eslint-disable no-undef */
/**
 * Prisma Seed Script
 *
 * Este script se ejecuta con: npm run seed
 * Crea datos iniciales para desarrollo y testing
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Iniciando seeding de la base de datos...\n');

  // Limpiar datos existentes
  console.log('[SEED] Limpiando datos existentes...');
  await prisma.nota.deleteMany();
  await prisma.evaluacion.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.matricula.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.estudiante.deleteMany();
  await prisma.usuario.deleteMany();
  console.log('[SEED] Datos limpiados\n');

  // ========================================
  // USUARIOS
  // ========================================
  console.log('[SEED] Creando usuarios...');

  const defaultPassword = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.usuario.create({
    data: {
      dni: '12345678',
      correo: 'admin@sga-p.edu.pe',
      contrasenaHash: defaultPassword,
      requiereCambioPassword: false,
      rol: 'admin',
      nombres: 'Administrador',
      apellidos: 'Sistema',
      telefono: '987654321',
    },
  });

  // Docentes
  const docentes = [];
  const docentesData = [
    {
      dni: '23456789',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez García',
      correo: 'jperez@sga-p.edu.pe',
    },
    {
      dni: '23456790',
      nombres: 'María Teresa',
      apellidos: 'López Sánchez',
      correo: 'mlopez@sga-p.edu.pe',
    },
    {
      dni: '23456791',
      nombres: 'Roberto',
      apellidos: 'Mendoza Ríos',
      correo: 'rmendoza@sga-p.edu.pe',
    },
    {
      dni: '23456792',
      nombres: 'Ana Lucía',
      apellidos: 'Torres Vega',
      correo: 'atorres@sga-p.edu.pe',
    },
    {
      dni: '23456793',
      nombres: 'Carlos Alberto',
      apellidos: 'Ramírez Cruz',
      correo: 'cramirez@sga-p.edu.pe',
    },
  ];

  for (const data of docentesData) {
    const docente = await prisma.usuario.create({
      data: {
        ...data,
        contrasenaHash: defaultPassword,
        requiereCambioPassword: false,
        rol: 'docente',
        telefono: '987654322',
      },
    });
    docentes.push(docente);
  }

  // Estudiantes
  const estudiantesUsuarios = [];
  const estudiantesData = [
    {
      dni: '34567890',
      nombres: 'María Elena',
      apellidos: 'Quispe Huamán',
      correo: 'mquispe@sga-p.edu.pe',
    },
    {
      dni: '34567891',
      nombres: 'José Luis',
      apellidos: 'García Flores',
      correo: 'jgarcia@sga-p.edu.pe',
    },
    {
      dni: '34567892',
      nombres: 'Ana Patricia',
      apellidos: 'Rodríguez Silva',
      correo: 'arodriguez@sga-p.edu.pe',
    },
    {
      dni: '34567893',
      nombres: 'Carlos Eduardo',
      apellidos: 'Martínez Díaz',
      correo: 'cmartinez@sga-p.edu.pe',
    },
    {
      dni: '34567894',
      nombres: 'Lucía Fernanda',
      apellidos: 'Hernández Rojas',
      correo: 'lhernandez@sga-p.edu.pe',
    },
    {
      dni: '34567895',
      nombres: 'Miguel Ángel',
      apellidos: 'González Vargas',
      correo: 'mgonzalez@sga-p.edu.pe',
    },
    {
      dni: '34567896',
      nombres: 'Sofía Isabel',
      apellidos: 'Sánchez Morales',
      correo: 'ssanchez@sga-p.edu.pe',
    },
    {
      dni: '34567897',
      nombres: 'Diego Alejandro',
      apellidos: 'Ramírez Castro',
      correo: 'dramirez@sga-p.edu.pe',
    },
    {
      dni: '34567898',
      nombres: 'Valentina',
      apellidos: 'Torres Mendoza',
      correo: 'vtorres@sga-p.edu.pe',
    },
    {
      dni: '34567899',
      nombres: 'Sebastián',
      apellidos: 'López Gutiérrez',
      correo: 'slopez@sga-p.edu.pe',
    },
    {
      dni: '34567900',
      nombres: 'Camila Andrea',
      apellidos: 'Pérez Jiménez',
      correo: 'cperez@sga-p.edu.pe',
    },
    {
      dni: '34567901',
      nombres: 'Mateo',
      apellidos: 'Fernández Ruiz',
      correo: 'mfernandez@sga-p.edu.pe',
    },
    {
      dni: '34567902',
      nombres: 'Isabella',
      apellidos: 'Díaz Herrera',
      correo: 'idiaz@sga-p.edu.pe',
    },
    {
      dni: '34567903',
      nombres: 'Nicolás',
      apellidos: 'Morales Ortiz',
      correo: 'nmorales@sga-p.edu.pe',
    },
    { dni: '34567904', nombres: 'Emma', apellidos: 'Castro Reyes', correo: 'ecastro@sga-p.edu.pe' },
    {
      dni: '34567905',
      nombres: 'Lucas',
      apellidos: 'Vargas Medina',
      correo: 'lvargas@sga-p.edu.pe',
    },
    { dni: '34567906', nombres: 'Mía', apellidos: 'Rojas Paredes', correo: 'mrojas@sga-p.edu.pe' },
    {
      dni: '34567907',
      nombres: 'Santiago',
      apellidos: 'Gutiérrez Campos',
      correo: 'sgutierrez@sga-p.edu.pe',
    },
    {
      dni: '34567908',
      nombres: 'Olivia',
      apellidos: 'Jiménez Navarro',
      correo: 'ojimenez@sga-p.edu.pe',
    },
    {
      dni: '34567909',
      nombres: 'Benjamín',
      apellidos: 'Ruiz Salazar',
      correo: 'bruiz@sga-p.edu.pe',
    },
  ];

  for (const data of estudiantesData) {
    const usuario = await prisma.usuario.create({
      data: {
        ...data,
        contrasenaHash: defaultPassword,
        requiereCambioPassword: false,
        rol: 'estudiante',
        telefono: '987654323',
      },
    });
    estudiantesUsuarios.push(usuario);
  }

  console.log(`  [OK] ${1 + docentes.length + estudiantesUsuarios.length} usuarios creados`);

  // ========================================
  // ESTUDIANTES
  // ========================================
  console.log('[SEED] Creando estudiantes...');

  const estudiantes = [];
  const modalidades = ['ORDINARIO', 'PRIMERA_OPCION', 'DIRIMENCIA'];
  const areas = ['A', 'B', 'C', 'D'];

  for (let i = 0; i < estudiantesUsuarios.length; i++) {
    const usuario = estudiantesUsuarios[i];
    const modalidad = modalidades[i % modalidades.length];
    const area = areas[i % areas.length];
    const year = 2025;
    const sequence = String(i + 1).padStart(3, '0');
    const codigoInterno = `${year}-${area}-${modalidad.substring(0, 3)}-${sequence}`;

    const estudiante = await prisma.estudiante.create({
      data: {
        usuarioId: usuario.usuarioId,
        codigoInterno,
        modalidad,
      },
    });
    // Guardar el área para usarla en las matrículas
    estudiante.areaPreferida = area;
    estudiantes.push(estudiante);
  }

  console.log(`  [OK] ${estudiantes.length} estudiantes creados`);

  // ========================================
  // CURSOS
  // ========================================
  console.log('[SEED] Creando cursos...');

  const cursosData = [
    // Área A
    { nombre: 'Matemática I', area: 'A', descripcion: 'Álgebra y Geometría' },
    { nombre: 'Física I', area: 'A', descripcion: 'Mecánica y Cinemática' },
    { nombre: 'Química I', area: 'A', descripcion: 'Química General' },
    { nombre: 'Biología I', area: 'A', descripcion: 'Biología Celular' },
    { nombre: 'Razonamiento Matemático', area: 'A', descripcion: 'Lógica y Razonamiento' },
    // Área B
    { nombre: 'Historia del Perú', area: 'B', descripcion: 'Historia Nacional' },
    { nombre: 'Geografía', area: 'B', descripcion: 'Geografía del Perú y el Mundo' },
    { nombre: 'Economía', area: 'B', descripcion: 'Economía General' },
    { nombre: 'Filosofía', area: 'B', descripcion: 'Filosofía y Lógica' },
    { nombre: 'Psicología', area: 'B', descripcion: 'Psicología General' },
    // Área C
    { nombre: 'Anatomía', area: 'C', descripcion: 'Anatomía Humana' },
    { nombre: 'Biología II', area: 'C', descripcion: 'Biología Avanzada' },
    { nombre: 'Química II', area: 'C', descripcion: 'Química Orgánica' },
    { nombre: 'Física II', area: 'C', descripcion: 'Física Moderna' },
    { nombre: 'Matemática II', area: 'C', descripcion: 'Cálculo' },
    // Área D
    { nombre: 'Literatura', area: 'D', descripcion: 'Literatura Universal' },
    { nombre: 'Lenguaje', area: 'D', descripcion: 'Comunicación y Lenguaje' },
    { nombre: 'Arte', area: 'D', descripcion: 'Historia del Arte' },
    { nombre: 'Inglés', area: 'D', descripcion: 'Inglés Intermedio' },
    { nombre: 'Redacción', area: 'D', descripcion: 'Redacción y Ortografía' },
  ];

  const cursos = [];
  for (const data of cursosData) {
    const curso = await prisma.curso.create({ data });
    cursos.push(curso);
  }

  console.log(`  [OK] ${cursos.length} cursos creados`);

  // ========================================
  // GRUPOS
  // ========================================
  console.log('[SEED] Creando grupos...');

  const gruposData = [
    {
      nombreGrupo: 'G1',
      area: 'A',
      modalidad: 'ORDINARIO',
      dias: 'Lunes,Miércoles,Viernes',
      horaInicio: '08:00',
      horaFin: '12:00',
      capacidad: 30,
    },
    {
      nombreGrupo: 'G2',
      area: 'A',
      modalidad: 'ORDINARIO',
      dias: 'Martes,Jueves,Sábado',
      horaInicio: '14:00',
      horaFin: '18:00',
      capacidad: 30,
    },
    {
      nombreGrupo: 'G3',
      area: 'A',
      modalidad: 'PRIMERA_OPCION',
      dias: 'Lunes,Miércoles,Viernes',
      horaInicio: '08:00',
      horaFin: '12:00',
      capacidad: 25,
    },
    {
      nombreGrupo: 'G1',
      area: 'B',
      modalidad: 'ORDINARIO',
      dias: 'Lunes,Miércoles,Viernes',
      horaInicio: '08:00',
      horaFin: '12:00',
      capacidad: 30,
    },
    {
      nombreGrupo: 'G2',
      area: 'B',
      modalidad: 'PRIMERA_OPCION',
      dias: 'Martes,Jueves,Sábado',
      horaInicio: '14:00',
      horaFin: '18:00',
      capacidad: 25,
    },
    {
      nombreGrupo: 'G1',
      area: 'C',
      modalidad: 'ORDINARIO',
      dias: 'Lunes,Miércoles,Viernes',
      horaInicio: '08:00',
      horaFin: '12:00',
      capacidad: 30,
    },
    {
      nombreGrupo: 'G2',
      area: 'C',
      modalidad: 'DIRIMENCIA',
      dias: 'Martes,Jueves,Sábado',
      horaInicio: '14:00',
      horaFin: '18:00',
      capacidad: 20,
    },
    {
      nombreGrupo: 'G1',
      area: 'D',
      modalidad: 'ORDINARIO',
      dias: 'Lunes,Miércoles,Viernes',
      horaInicio: '08:00',
      horaFin: '12:00',
      capacidad: 30,
    },
  ];

  const grupos = [];
  for (const data of gruposData) {
    const [horaInicioH, horaInicioM] = data.horaInicio.split(':');
    const [horaFinH, horaFinM] = data.horaFin.split(':');

    const grupo = await prisma.grupo.create({
      data: {
        nombreGrupo: data.nombreGrupo,
        area: data.area,
        modalidad: data.modalidad,
        dias: data.dias,
        horaInicio: new Date(2000, 0, 1, parseInt(horaInicioH), parseInt(horaInicioM)),
        horaFin: new Date(2000, 0, 1, parseInt(horaFinH), parseInt(horaFinM)),
        capacidad: data.capacidad,
      },
    });
    grupos.push(grupo);
  }

  console.log(`  [OK] ${grupos.length} grupos creados`);

  // ========================================
  // MATRÍCULAS
  // ========================================
  console.log('[SEED] Creando matrículas...');

  const matriculas = [];
  for (let i = 0; i < estudiantes.length; i++) {
    const estudiante = estudiantes[i];
    // Buscar un grupo que coincida con la modalidad y área preferida del estudiante
    const grupoCompatible = grupos.find(
      g => g.modalidad === estudiante.modalidad && g.area === estudiante.areaPreferida
    );

    if (grupoCompatible) {
      const matricula = await prisma.matricula.create({
        data: {
          estudianteId: estudiante.estudianteId,
          grupoId: grupoCompatible.grupoId,
          fechaMatricula: new Date(2025, 1, 1 + i),
          montoPagado: 500.0,
          estado: 'MATRICULADO',
        },
      });
      matriculas.push(matricula);
    }
  }

  console.log(`  [OK] ${matriculas.length} matrículas creadas`);

  // ========================================
  // EVALUACIONES
  // ========================================
  console.log('[SEED] Creando evaluaciones...');

  const evaluaciones = [];
  const descripciones = ['Examen Parcial', 'Examen Final', 'Simulacro', 'Práctica Calificada'];

  for (let i = 0; i < grupos.length; i++) {
    const grupo = grupos[i];
    for (let j = 0; j < 3; j++) {
      const descripcion = descripciones[j % descripciones.length];
      const semana = (j + 1) * 4;
      const fechaEval = new Date(2025, 2, 10 + j * 14);
      const evaluacion = await prisma.evaluacion.create({
        data: {
          descripcion: `${descripcion} - Semana ${semana}`,
          fechaEvaluacion: fechaEval,
          numeroSemana: semana,
          grupoId: grupo.grupoId,
          duracionMinutos: 120,
          estado: 'PROGRAMADA',
        },
      });
      evaluaciones.push(evaluacion);
    }
  }

  console.log(`  [OK] ${evaluaciones.length} evaluaciones creadas`);

  // ========================================
  // ASISTENCIAS
  // ========================================
  console.log('[SEED] Creando asistencias...');

  const asistencias = [];
  const estados = ['PRESENTE', 'AUSENTE', 'TARDANZA'];

  for (const matricula of matriculas) {
    // Crear 10 registros de asistencia por estudiante
    for (let i = 0; i < 10; i++) {
      const estado = i < 7 ? 'PRESENTE' : estados[i % estados.length];
      const asistencia = await prisma.asistencia.create({
        data: {
          estudianteId: matricula.estudianteId,
          grupoId: matricula.grupoId,
          fechaClase: new Date(2025, 2, 1 + i),
          estado,
        },
      });
      asistencias.push(asistencia);
    }
  }

  console.log(`  [OK] ${asistencias.length} asistencias creadas`);

  // ========================================
  // NOTAS
  // ========================================
  console.log('[SEED] Creando notas...');

  const notas = [];

  for (const evaluacion of evaluaciones) {
    // Obtener estudiantes del grupo de esta evaluación
    const matriculasGrupo = matriculas.filter(m => m.grupoId === evaluacion.grupoId);

    // Obtener cursos del área del grupo
    const grupo = grupos.find(g => g.grupoId === evaluacion.grupoId);
    const cursosArea = cursos.filter(c => c.area === grupo.area);

    for (const matricula of matriculasGrupo) {
      // Crear notas para 3 cursos aleatorios del área
      const cursosSeleccionados = cursosArea.slice(0, 3);

      for (const curso of cursosSeleccionados) {
        const notaValor = Math.floor(Math.random() * 9) + 11; // Notas entre 11 y 20
        const nota = await prisma.nota.create({
          data: {
            estudianteId: matricula.estudianteId,
            evaluacionId: evaluacion.evaluacionId,
            cursoId: curso.cursoId,
            nota: notaValor,
          },
        });
        notas.push(nota);
      }
    }
  }

  console.log(`  [OK] ${notas.length} notas creadas`);

  console.log('\n[SEED] Seeding completado exitosamente!\n');

  // Mostrar resumen
  console.log('[SUMMARY] Resumen:');
  console.log(`  - Usuarios: ${1 + docentes.length + estudiantesUsuarios.length}`);
  console.log(`  - Estudiantes: ${estudiantes.length}`);
  console.log(`  - Cursos: ${cursos.length}`);
  console.log(`  - Grupos: ${grupos.length}`);
  console.log(`  - Matrículas: ${matriculas.length}`);
  console.log(`  - Evaluaciones: ${evaluaciones.length}`);
  console.log(`  - Asistencias: ${asistencias.length}`);
  console.log(`  - Notas: ${notas.length}`);

  // ========================================
  // VISTA: estudiantes_completa
  // ========================================
  console.log('\n[SEED] Creando vista estudiantes_completa...');
  try {
    // Verificar si existe como tabla y eliminarla
    const rows = await prisma.$queryRawUnsafe(`
      SELECT TABLE_TYPE FROM information_schema.tables
      WHERE table_schema = DATABASE() AND TABLE_NAME = 'estudiantes_completa'
    `);
    
    if (rows && rows.length > 0) {
      const tableType = rows[0].TABLE_TYPE || rows[0].table_type;
      if (tableType === 'BASE TABLE') {
        await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS estudiantes_completa');
        console.log('[SEED] Eliminada tabla estudiantes_completa (no era VIEW)');
      }
    }
    
    // Crear la vista
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE VIEW estudiantes_completa AS
      SELECT
        e.estudiante_id AS estudianteId,
        e.usuario_id AS usuarioId,
        u.dni,
        u.correo,
        u.nombres,
        u.apellidos,
        u.telefono,
        u.estado AS estadoUsuario,
        e.codigo_interno AS codigoInterno,
        e.modalidad
      FROM estudiantes e
      INNER JOIN usuarios u ON e.usuario_id = u.usuario_id
    `);
    console.log('[SEED] Vista estudiantes_completa creada');
  } catch (error) {
    console.error('[ERROR] Error creando vista estudiantes_completa:', error.message);
    throw error;
  }

  console.log('\n[CREDENTIALS] Credenciales de prueba:');
  console.log('  Todos los usuarios: Password: password123');
  console.log('  Admin:      DNI: 12345678');
  console.log('  Docente:    DNI: 23456789');
  console.log('  Estudiante: DNI: 34567890');
  console.log('');
}

main()
  .catch(e => {
    console.error('[ERROR] Error durante el seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
