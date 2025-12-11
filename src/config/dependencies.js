/**
 * Dependency Configuration
 * Configura e inicializa todas las dependencias del sistema
 */

const container = require('./container');

// Repositories
const UserRepository = require('../repositories/UserRepository');
const StudentRepository = require('../repositories/StudentRepository');
const CourseRepository = require('../repositories/CourseRepository');
const GroupRepository = require('../repositories/GroupRepository');
const EnrollmentRepository = require('../repositories/EnrollmentRepository');

// Services
const AuthService = require('../services/AuthService');
const UserService = require('../services/UserService');
const StudentService = require('../services/StudentService');
const CourseService = require('../services/CourseService');
const GroupService = require('../services/GroupService');
const EnrollmentService = require('../services/EnrollmentService');

// Use Cases
const RegisterUserUseCase = require('../use-cases/RegisterUserUseCase');
const GetUsersUseCase = require('../use-cases/GetUsersUseCase');
const GetUserByIdUseCase = require('../use-cases/GetUserByIdUseCase');
const UpdateUserUseCase = require('../use-cases/UpdateUserUseCase');
const DeleteUserUseCase = require('../use-cases/DeleteUserUseCase');
const CreateStudentUseCase = require('../use-cases/CreateStudentUseCase');
const GetStudentsUseCase = require('../use-cases/GetStudentsUseCase');
const GetStudentByIdUseCase = require('../use-cases/GetStudentByIdUseCase');
const UpdateStudentUseCase = require('../use-cases/UpdateStudentUseCase');
const DeleteStudentUseCase = require('../use-cases/DeleteStudentUseCase');
const CreateCourseUseCase = require('../use-cases/CreateCourseUseCase');
const GetCoursesUseCase = require('../use-cases/GetCoursesUseCase');
const GetCourseByIdUseCase = require('../use-cases/GetCourseByIdUseCase');
const UpdateCourseUseCase = require('../use-cases/UpdateCourseUseCase');
const DeleteCourseUseCase = require('../use-cases/DeleteCourseUseCase');
const CreateGroupUseCase = require('../use-cases/CreateGroupUseCase');
const GetGroupsUseCase = require('../use-cases/GetGroupsUseCase');
const GetGroupByIdUseCase = require('../use-cases/GetGroupByIdUseCase');
const UpdateGroupUseCase = require('../use-cases/UpdateGroupUseCase');
const ActivateDeactivateGroupUseCase = require('../use-cases/ActivateDeactivateGroupUseCase');
const EnrollStudentUseCase = require('../use-cases/EnrollStudentUseCase');
const GetEnrollmentsUseCase = require('../use-cases/GetEnrollmentsUseCase');
const WithdrawStudentUseCase = require('../use-cases/WithdrawStudentUseCase');

// Controllers
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const StudentController = require('../controllers/StudentController');
const CourseController = require('../controllers/CourseController');
const GroupController = require('../controllers/GroupController');
const EnrollmentController = require('../controllers/EnrollmentController');

/**
 * Configurar todas las dependencias
 */
const configureDependencies = () => {
  // JWT Configuration
  const jwtConfig = {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  };

  // Registrar Repositories como singletons
  container.singleton('userRepository', () => new UserRepository());
  container.singleton('studentRepository', () => new StudentRepository());
  container.singleton('courseRepository', () => new CourseRepository());
  container.singleton('groupRepository', () => new GroupRepository());
  container.singleton('enrollmentRepository', () => new EnrollmentRepository());

  // Registrar Services como singletons
  container.singleton('authService', (c) => {
    return new AuthService(
      c.resolve('userRepository'),
      jwtConfig
    );
  });

  container.singleton('userService', (c) => {
    return new UserService(c.resolve('userRepository'));
  });

  container.singleton('studentService', (c) => {
    return new StudentService(
      c.resolve('studentRepository'),
      c.resolve('userRepository')
    );
  });

  container.singleton('courseService', (c) => {
    return new CourseService(c.resolve('courseRepository'));
  });

  container.singleton('groupService', (c) => {
    return new GroupService(c.resolve('groupRepository'));
  });

  container.singleton('enrollmentService', (c) => {
    return new EnrollmentService(
      c.resolve('enrollmentRepository'),
      c.resolve('groupRepository'),
      c.resolve('studentRepository')
    );
  });

  // Registrar Use Cases como singletons
  container.singleton('registerUserUseCase', (c) => {
    return new RegisterUserUseCase(
      c.resolve('userRepository'),
      c.resolve('userService')
    );
  });

  container.singleton('getUsersUseCase', (c) => {
    return new GetUsersUseCase(c.resolve('userRepository'));
  });

  container.singleton('getUserByIdUseCase', (c) => {
    return new GetUserByIdUseCase(c.resolve('userRepository'));
  });

  container.singleton('updateUserUseCase', (c) => {
    return new UpdateUserUseCase(
      c.resolve('userRepository'),
      c.resolve('userService')
    );
  });

  container.singleton('deleteUserUseCase', (c) => {
    return new DeleteUserUseCase(c.resolve('userRepository'));
  });

  container.singleton('createStudentUseCase', (c) => {
    return new CreateStudentUseCase(
      c.resolve('studentRepository'),
      c.resolve('studentService')
    );
  });

  container.singleton('getStudentsUseCase', (c) => {
    return new GetStudentsUseCase(c.resolve('studentRepository'));
  });

  container.singleton('getStudentByIdUseCase', (c) => {
    return new GetStudentByIdUseCase(c.resolve('studentRepository'));
  });

  container.singleton('updateStudentUseCase', (c) => {
    return new UpdateStudentUseCase(
      c.resolve('studentRepository'),
      c.resolve('studentService')
    );
  });

  container.singleton('deleteStudentUseCase', (c) => {
    return new DeleteStudentUseCase(
      c.resolve('studentRepository'),
      c.resolve('userRepository')
    );
  });

  container.singleton('createCourseUseCase', (c) => {
    return new CreateCourseUseCase(
      c.resolve('courseRepository'),
      c.resolve('courseService')
    );
  });

  container.singleton('getCoursesUseCase', (c) => {
    return new GetCoursesUseCase(c.resolve('courseRepository'));
  });

  container.singleton('getCourseByIdUseCase', (c) => {
    return new GetCourseByIdUseCase(c.resolve('courseRepository'));
  });

  container.singleton('updateCourseUseCase', (c) => {
    return new UpdateCourseUseCase(
      c.resolve('courseRepository'),
      c.resolve('courseService')
    );
  });

  container.singleton('deleteCourseUseCase', (c) => {
    return new DeleteCourseUseCase(
      c.resolve('courseRepository'),
      c.resolve('courseService')
    );
  });

  container.singleton('createGroupUseCase', (c) => {
    return new CreateGroupUseCase(
      c.resolve('groupRepository'),
      c.resolve('groupService')
    );
  });

  container.singleton('getGroupsUseCase', (c) => {
    return new GetGroupsUseCase(c.resolve('groupRepository'));
  });

  container.singleton('getGroupByIdUseCase', (c) => {
    return new GetGroupByIdUseCase(c.resolve('groupRepository'));
  });

  container.singleton('updateGroupUseCase', (c) => {
    return new UpdateGroupUseCase(
      c.resolve('groupRepository'),
      c.resolve('groupService')
    );
  });

  container.singleton('activateDeactivateGroupUseCase', (c) => {
    return new ActivateDeactivateGroupUseCase(c.resolve('groupRepository'));
  });

  container.singleton('enrollStudentUseCase', (c) => {
    return new EnrollStudentUseCase(
      c.resolve('enrollmentRepository'),
      c.resolve('enrollmentService')
    );
  });

  container.singleton('getEnrollmentsUseCase', (c) => {
    return new GetEnrollmentsUseCase(c.resolve('enrollmentRepository'));
  });

  container.singleton('withdrawStudentUseCase', (c) => {
    return new WithdrawStudentUseCase(
      c.resolve('enrollmentRepository'),
      c.resolve('enrollmentService')
    );
  });

  // Registrar Controllers (transient - nueva instancia cada vez)
  container.register('authController', (c) => {
    return new AuthController(c.resolve('authService'));
  });

  container.register('userController', (c) => {
    return new UserController(
      c.resolve('registerUserUseCase'),
      c.resolve('getUsersUseCase'),
      c.resolve('getUserByIdUseCase'),
      c.resolve('updateUserUseCase'),
      c.resolve('deleteUserUseCase')
    );
  });

  container.register('studentController', (c) => {
    return new StudentController(
      c.resolve('createStudentUseCase'),
      c.resolve('getStudentsUseCase'),
      c.resolve('getStudentByIdUseCase'),
      c.resolve('updateStudentUseCase'),
      c.resolve('deleteStudentUseCase')
    );
  });

  container.register('courseController', (c) => {
    return new CourseController(
      c.resolve('createCourseUseCase'),
      c.resolve('getCoursesUseCase'),
      c.resolve('getCourseByIdUseCase'),
      c.resolve('updateCourseUseCase'),
      c.resolve('deleteCourseUseCase')
    );
  });

  container.register('groupController', (c) => {
    return new GroupController(
      c.resolve('createGroupUseCase'),
      c.resolve('getGroupsUseCase'),
      c.resolve('getGroupByIdUseCase'),
      c.resolve('updateGroupUseCase'),
      c.resolve('activateDeactivateGroupUseCase')
    );
  });

  container.register('enrollmentController', (c) => {
    return new EnrollmentController(
      c.resolve('enrollStudentUseCase'),
      c.resolve('getEnrollmentsUseCase'),
      c.resolve('withdrawStudentUseCase')
    );
  });
};

module.exports = {
  configureDependencies,
  container,
};
