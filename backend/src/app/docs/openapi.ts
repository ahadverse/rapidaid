import { config } from '../../config';

const bearer = [{ bearerAuth: [] }];

const envelope = (dataExample: unknown, message: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    statusCode: { type: 'integer', example: 200 },
    message: { type: 'string', example: message },
    data: { example: dataExample },
  },
});

const ok = (message: string, dataExample: unknown = {}) => ({
  description: message,
  content: { 'application/json': { schema: envelope(dataExample, message) } },
});

const paginated = (message: string) => ({
  description: message,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: message },
          meta: { $ref: '#/components/schemas/Meta' },
          data: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
});

const errors = {
  400: { $ref: '#/components/responses/BadRequest' },
  401: { $ref: '#/components/responses/Unauthorized' },
  403: { $ref: '#/components/responses/Forbidden' },
  404: { $ref: '#/components/responses/NotFound' },
  409: { $ref: '#/components/responses/Conflict' },
};

const pick = (...codes: number[]) =>
  Object.fromEntries(codes.map((code) => [code, errors[code as keyof typeof errors]]));

const paginationParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
  { name: 'sortBy', in: 'query', schema: { type: 'string' } },
  { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
];

const uuidParam = (name: string, description: string) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string', format: 'uuid' },
});

const body = (schema: string) => ({
  required: true,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } },
});

type TAccess = { roles: string; detail?: string };

export const accessByOperation: Record<string, TAccess> = {
  'get /health': { roles: 'Public' },

  'post /auth/register': { roles: 'Public' },
  'post /auth/login': { roles: 'Public' },
  'get /auth/google': { roles: 'Public' },
  'get /auth/google/callback': { roles: 'Public' },
  'post /auth/refresh-token': { roles: 'Public', detail: 'Public, but requires the refresh cookie.' },
  'post /auth/change-password': { roles: 'Authenticated', detail: 'Any authenticated role, on their own account.' },
  'post /auth/logout': { roles: 'Authenticated', detail: 'Any authenticated role.' },

  'get /users/me': { roles: 'Authenticated', detail: 'Any authenticated role, own record only.' },
  'patch /users/me': { roles: 'Authenticated', detail: 'Any authenticated role, own record only.' },
  'get /users': { roles: 'ADMIN' },
  'get /users/{id}': { roles: 'ADMIN' },
  'patch /users/{id}': { roles: 'ADMIN' },
  'delete /users/{id}': { roles: 'ADMIN' },

  'post /drivers': { roles: 'ADMIN' },
  'get /drivers': { roles: 'ADMIN' },
  'get /drivers/me': { roles: 'DRIVER', detail: 'DRIVER only, own profile.' },
  'patch /drivers/me/availability': { roles: 'DRIVER', detail: 'DRIVER only, own availability.' },

  'post /ambulances': { roles: 'ADMIN' },
  'get /ambulances': { roles: 'ADMIN, DRIVER' },
  'get /ambulances/{id}': { roles: 'ADMIN, DRIVER' },
  'patch /ambulances/{id}': { roles: 'ADMIN' },
  'delete /ambulances/{id}': { roles: 'ADMIN' },
  'patch /ambulances/{id}/status': { roles: 'ADMIN, DRIVER' },

  'post /hospitals': { roles: 'ADMIN' },
  'get /hospitals': { roles: 'Authenticated', detail: 'Any authenticated role.' },
  'get /hospitals/{id}': { roles: 'Authenticated', detail: 'Any authenticated role.' },
  'patch /hospitals/{id}': { roles: 'ADMIN' },
  'delete /hospitals/{id}': { roles: 'ADMIN' },

  'post /emergency-requests': { roles: 'PATIENT' },
  'get /emergency-requests': {
    roles: 'PATIENT, ADMIN',
    detail: 'ADMIN sees every request. PATIENT sees only their own.',
  },
  'get /emergency-requests/{id}': {
    roles: 'PATIENT, ADMIN',
    detail: 'The PATIENT who raised it, or any ADMIN.',
  },
  'patch /emergency-requests/{id}': {
    roles: 'PATIENT',
    detail: 'The PATIENT who raised it, while it is still PENDING.',
  },
  'patch /emergency-requests/{id}/cancel': {
    roles: 'PATIENT, ADMIN',
    detail: 'The PATIENT who raised it, or any ADMIN.',
  },
  'post /emergency-requests/{id}/dispatch': { roles: 'ADMIN' },

  'get /trips': { roles: 'ADMIN' },
  'get /trips/me': {
    roles: 'DRIVER, PATIENT',
    detail: 'DRIVER sees assigned trips. PATIENT sees their own history.',
  },
  'get /trips/{id}': {
    roles: 'DRIVER, PATIENT, ADMIN',
    detail: 'The assigned DRIVER, the PATIENT on the trip, or any ADMIN.',
  },
  'patch /trips/{id}/status': {
    roles: 'DRIVER, ADMIN',
    detail: 'The assigned DRIVER, or any ADMIN stepping in.',
  },
  'patch /trips/{id}/hospital': {
    roles: 'DRIVER, ADMIN',
    detail: 'The assigned DRIVER, or any ADMIN stepping in.',
  },
  'patch /trips/{id}/complete': {
    roles: 'DRIVER, ADMIN',
    detail: 'The assigned DRIVER, or any ADMIN stepping in.',
  },

  'post /payments/init/{tripId}': {
    roles: 'PATIENT',
    detail: 'The PATIENT on the trip, paying their own completed bill.',
  },
  'post /payments/success': { roles: 'Public', detail: 'Posted by SSLCommerz, not by a client.' },
  'post /payments/fail': { roles: 'Public', detail: 'Posted by SSLCommerz, not by a client.' },
  'post /payments/cancel': { roles: 'Public', detail: 'Posted by SSLCommerz, not by a client.' },
  'post /payments/ipn': { roles: 'Public', detail: 'Posted by SSLCommerz server to server.' },
};

type TOperation = {
  summary?: string;
  description?: string;
  [key: string]: unknown;
};

const withAccess = (paths: Record<string, Record<string, TOperation>>) => {
  Object.entries(paths).forEach(([path, operations]) => {
    Object.entries(operations).forEach(([method, operation]) => {
      const access = accessByOperation[`${method} ${path}`];

      if (!access) {
        throw new Error(`Missing documented access for ${method.toUpperCase()} ${path}`);
      }

      operation['x-roles'] = access.roles;
      operation.description = [
        `**Access:** ${access.detail ?? access.roles}`,
        operation.description,
      ]
        .filter(Boolean)
        .join('\n\n');
    });
  });

  return paths;
};

export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'RapidAid API',
    version: '1.0.0',
    description:
      'Emergency Response Platform. Priority-based ambulance dispatch, from emergency call to hospital arrival and payment.\n\n' +
      '## Authorization\n\n' +
      'Every operation carries a role badge on the right of its row, and repeats it as an **Access** line once opened.\n\n' +
      '| Label | Who may call it |\n' +
      '| --- | --- |\n' +
      '| `Public` | No token required |\n' +
      '| `Authenticated` | Any signed-in user, usually limited to their own record |\n' +
      '| `PATIENT` | Patients, on their own emergencies, trips and bills |\n' +
      '| `DRIVER` | Drivers, on their own profile and their assigned trips |\n' +
      '| `ADMIN` | Full access across the platform |\n\n' +
      'Role alone is not always sufficient. Where ownership also applies, the **Access** line says so, ' +
      'and the API answers `403` when the role is right but the record belongs to someone else.\n\n' +
      '## Getting a token\n\n' +
      'Call `POST /auth/login`, then paste the returned `accessToken` into the **Authorize** button above.\n\n' +
      '| Role | Email | Password |\n' +
      '| --- | --- | --- |\n' +
      '| ADMIN | admin@rapidaid.com | Admin@RapidAid2026 |\n' +
      '| DRIVER | driver1@rapidaid.com | Demo@RapidAid2026 |\n' +
      '| PATIENT | patient@rapidaid.com | Demo@RapidAid2026 |',
  },
  servers: [
    { url: `http://localhost:${config.port}/api/v1`, description: 'Local development' },
    { url: 'https://rapidaid-api.onrender.com/api/v1', description: 'Production' },
  ],
  tags: [
    { name: 'Auth', description: 'Registration, login, Google OAuth, tokens' },
    { name: 'Users', description: 'Profile and admin user management' },
    { name: 'Drivers', description: 'Driver profiles and availability' },
    { name: 'Ambulances', description: 'Fleet CRUD with pagination, filtering, search and sort' },
    { name: 'Hospitals', description: 'Hospital directory' },
    { name: 'Emergency Requests', description: 'Raising and dispatching emergencies' },
    { name: 'Trips', description: 'The dispatch state machine and fare settlement' },
    { name: 'Payments', description: 'SSLCommerz checkout and gateway callbacks' },
    { name: 'Utility', description: 'Health and documentation' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Meta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 42 },
          totalPage: { type: 'integer', example: 5 },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Validation error' },
          errorSources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string', example: 'body.email' },
                message: { type: 'string', example: 'A valid email is required' },
              },
            },
          },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password', 'phone'],
        properties: {
          name: { type: 'string', minLength: 3, example: 'Tanvir Ahmed' },
          email: { type: 'string', format: 'email', example: 'tanvir@example.com' },
          password: { type: 'string', minLength: 8, example: 'Patient@2026' },
          phone: { type: 'string', example: '+8801911000301', description: 'Bangladeshi number' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'patient@rapidaid.com' },
          password: { type: 'string', example: 'Demo@RapidAid2026' },
        },
      },
      ChangePasswordInput: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: { type: 'string', example: 'Demo@RapidAid2026' },
          newPassword: { type: 'string', minLength: 8, example: 'NewDemo@2026' },
        },
      },
      UpdateProfileInput: {
        type: 'object',
        description: 'At least one field is required',
        properties: {
          name: { type: 'string', minLength: 3, example: 'Tanvir Ahmed' },
          phone: { type: 'string', example: '+8801911000399' },
        },
      },
      UpdateUserStatusInput: {
        type: 'object',
        required: ['status'],
        properties: { status: { type: 'string', enum: ['ACTIVE', 'BLOCKED'], example: 'BLOCKED' } },
      },
      CreateDriverInput: {
        type: 'object',
        required: ['name', 'email', 'password', 'phone', 'licenseNumber', 'nid'],
        properties: {
          name: { type: 'string', example: 'Rafiqul Islam' },
          email: { type: 'string', format: 'email', example: 'driver4@rapidaid.com' },
          password: { type: 'string', minLength: 8, example: 'Demo@RapidAid2026' },
          phone: { type: 'string', example: '+8801811000204' },
          licenseNumber: { type: 'string', example: 'DL-RA-77123' },
          nid: { type: 'string', minLength: 10, example: '1993771201237' },
          ambulanceId: { type: 'string', format: 'uuid' },
        },
      },
      UpdateAvailabilityInput: {
        type: 'object',
        required: ['isAvailable'],
        properties: { isAvailable: { type: 'boolean', example: true } },
      },
      CreateAmbulanceInput: {
        type: 'object',
        required: ['regNumber', 'type', 'baseFare', 'perKmRate', 'stationArea'],
        properties: {
          regNumber: { type: 'string', minLength: 4, example: 'DHA-AMB-1005' },
          type: { type: 'string', enum: ['BASIC', 'AC', 'ICU', 'FREEZER'], example: 'ICU' },
          status: { type: 'string', enum: ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE'] },
          baseFare: { type: 'number', example: 2000 },
          perKmRate: { type: 'number', example: 80 },
          stationArea: { type: 'string', example: 'Gulshan' },
        },
      },
      UpdateAmbulanceInput: {
        type: 'object',
        description: 'At least one field is required',
        properties: {
          regNumber: { type: 'string', example: 'DHA-AMB-1005' },
          type: { type: 'string', enum: ['BASIC', 'AC', 'ICU', 'FREEZER'] },
          baseFare: { type: 'number', example: 2200 },
          perKmRate: { type: 'number', example: 85 },
          stationArea: { type: 'string', example: 'Banani' },
        },
      },
      UpdateAmbulanceStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE'],
            example: 'MAINTENANCE',
          },
        },
      },
      CreateHospitalInput: {
        type: 'object',
        required: ['name', 'address', 'area', 'phone', 'specializations'],
        properties: {
          name: { type: 'string', example: 'Evercare Hospital Dhaka' },
          address: { type: 'string', example: 'Plot 81, Block E, Bashundhara R/A' },
          area: { type: 'string', example: 'Bashundhara' },
          phone: { type: 'string', example: '+8801711000104' },
          specializations: {
            type: 'array',
            items: { type: 'string' },
            example: ['EMERGENCY', 'CARDIOLOGY', 'ICU'],
          },
          availableBeds: { type: 'integer', minimum: 0, example: 30 },
        },
      },
      UpdateHospitalInput: {
        type: 'object',
        description: 'At least one field is required',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' },
          area: { type: 'string', example: 'Gulshan' },
          phone: { type: 'string' },
          specializations: { type: 'array', items: { type: 'string' } },
          availableBeds: { type: 'integer', minimum: 0, example: 12 },
        },
      },
      CreateEmergencyRequestInput: {
        type: 'object',
        required: ['pickupAddress', 'patientCondition'],
        properties: {
          pickupAddress: { type: 'string', example: 'House 12, Road 5, Dhanmondi, Dhaka' },
          pickupLat: { type: 'number', example: 23.7461 },
          pickupLng: { type: 'number', example: 90.376 },
          patientCondition: {
            type: 'string',
            example: 'Road accident, heavy bleeding from the leg',
          },
          priority: {
            type: 'string',
            enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
            example: 'CRITICAL',
          },
          requestedAmbulanceType: { type: 'string', enum: ['BASIC', 'AC', 'ICU', 'FREEZER'] },
        },
      },
      UpdateEmergencyRequestInput: {
        type: 'object',
        description: 'Only while the request is still PENDING. At least one field is required.',
        properties: {
          pickupAddress: { type: 'string' },
          pickupLat: { type: 'number' },
          pickupLng: { type: 'number' },
          patientCondition: { type: 'string' },
          priority: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
          requestedAmbulanceType: { type: 'string', enum: ['BASIC', 'AC', 'ICU', 'FREEZER'] },
        },
      },
      CancelInput: {
        type: 'object',
        required: ['cancelReason'],
        properties: {
          cancelReason: {
            type: 'string',
            minLength: 5,
            example: 'Patient was taken by a family car',
          },
        },
      },
      DispatchInput: {
        type: 'object',
        description: 'Both optional; omit to let the dispatcher pick the best available crew.',
        properties: {
          ambulanceId: { type: 'string', format: 'uuid' },
          driverId: { type: 'string', format: 'uuid' },
        },
      },
      UpdateTripStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: [
              'EN_ROUTE_TO_PICKUP',
              'PATIENT_PICKED_UP',
              'EN_ROUTE_TO_HOSPITAL',
              'ARRIVED_AT_HOSPITAL',
              'CANCELLED',
            ],
            example: 'EN_ROUTE_TO_PICKUP',
          },
          cancelReason: {
            type: 'string',
            minLength: 5,
            description: 'Required only when status is CANCELLED',
          },
        },
      },
      SelectHospitalInput: {
        type: 'object',
        required: ['hospitalId'],
        properties: { hospitalId: { type: 'string', format: 'uuid' } },
      },
      CompleteTripInput: {
        type: 'object',
        required: ['distanceKm'],
        properties: {
          distanceKm: {
            type: 'number',
            exclusiveMinimum: 0,
            maximum: 500,
            example: 12.35,
            description: 'Fare is baseFare + perKmRate x distanceKm',
          },
        },
      },
      GatewayCallback: {
        type: 'object',
        required: ['tran_id'],
        description: 'Posted by SSLCommerz as application/x-www-form-urlencoded.',
        properties: {
          tran_id: { type: 'string', example: 'RA-MTQ1NH1W-F2F4D4DC' },
          val_id: { type: 'string', example: '260906224706iH88MbX2PLhYH1V' },
          status: { type: 'string', example: 'VALID' },
          amount: { type: 'string', example: '675.00' },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Validation failed or the request breaks a business rule',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Unauthorized: {
        description: 'Missing or invalid access token',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'Authenticated, but not allowed to perform this action',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Resource does not exist',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Conflict: {
        description: 'Conflicts with the current state of the resource',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
  paths: withAccess({
    '/health': {
      get: {
        tags: ['Utility'],
        summary: 'Service health check',
        security: [],
        responses: { 200: ok('RapidAid API is running', { service: 'rapidaid-api', uptime: 66.19 }) },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a patient account',
        security: [],
        requestBody: body('RegisterInput'),
        responses: {
          201: ok('Registration successful'),
          ...pick(400, 409),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive an access token',
        description: 'Also sets an httpOnly refresh token cookie.',
        security: [],
        requestBody: body('LoginInput'),
        responses: {
          200: ok('Login successful', { accessToken: 'eyJhbGciOi...', user: {} }),
          ...pick(400, 401, 403),
        },
      },
    },
    '/auth/google': {
      get: {
        tags: ['Auth'],
        summary: 'Start Google OAuth',
        description: 'Redirects to Google. Open in a browser rather than Postman.',
        security: [],
        responses: { 302: { description: 'Redirect to the Google consent screen' } },
      },
    },
    '/auth/google/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Finish Google OAuth and issue a token',
        security: [],
        parameters: [
          { name: 'code', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'state', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: ok('Login successful'), ...pick(400, 401) },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Exchange the refresh cookie for a new access token',
        security: [],
        responses: { 200: ok('Access token refreshed successfully'), ...pick(401) },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change your own password',
        security: bearer,
        requestBody: body('ChangePasswordInput'),
        responses: { 200: ok('Password changed successfully'), ...pick(400, 401) },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Clear the refresh cookie',
        security: bearer,
        responses: { 200: ok('Logged out successfully'), ...pick(401) },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get your own profile',
        security: bearer,
        responses: { 200: ok('Profile retrieved successfully'), ...pick(401) },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update your own profile',
        security: bearer,
        requestBody: body('UpdateProfileInput'),
        responses: { 200: ok('Profile updated successfully'), ...pick(400, 401) },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        description: 'ADMIN only. Paginated, filterable by role and status, searchable by name or email.',
        security: bearer,
        parameters: [
          ...paginationParams,
          { name: 'searchTerm', in: 'query', schema: { type: 'string' } },
          {
            name: 'role',
            in: 'query',
            schema: { type: 'string', enum: ['PATIENT', 'DRIVER', 'ADMIN'] },
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['ACTIVE', 'BLOCKED'] },
          },
        ],
        responses: { 200: paginated('Users retrieved successfully'), ...pick(401, 403) },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user by id',
        security: bearer,
        parameters: [uuidParam('id', 'User id')],
        responses: { 200: ok('User retrieved successfully'), ...pick(401, 403, 404) },
      },
      patch: {
        tags: ['Users'],
        summary: 'Block or unblock a user',
        description: 'ADMIN only. Writes an audit log entry.',
        security: bearer,
        parameters: [uuidParam('id', 'User id')],
        requestBody: body('UpdateUserStatusInput'),
        responses: { 200: ok('User status updated successfully'), ...pick(400, 401, 403, 404) },
      },
      delete: {
        tags: ['Users'],
        summary: 'Soft delete a user',
        description: 'ADMIN only. Sets isDeleted rather than removing the row.',
        security: bearer,
        parameters: [uuidParam('id', 'User id')],
        responses: { 200: ok('User deleted successfully'), ...pick(401, 403, 404) },
      },
    },
    '/drivers': {
      post: {
        tags: ['Drivers'],
        summary: 'Create a driver account and profile',
        security: bearer,
        requestBody: body('CreateDriverInput'),
        responses: { 201: ok('Driver created successfully'), ...pick(400, 401, 403, 409) },
      },
      get: {
        tags: ['Drivers'],
        summary: 'List drivers',
        security: bearer,
        parameters: [
          ...paginationParams,
          { name: 'searchTerm', in: 'query', schema: { type: 'string' } },
          { name: 'isAvailable', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
        ],
        responses: { 200: paginated('Drivers retrieved successfully'), ...pick(401, 403) },
      },
    },
    '/drivers/me': {
      get: {
        tags: ['Drivers'],
        summary: 'Get your own driver profile',
        security: bearer,
        responses: { 200: ok('Driver profile retrieved successfully'), ...pick(401, 403, 404) },
      },
    },
    '/drivers/me/availability': {
      patch: {
        tags: ['Drivers'],
        summary: 'Go on or off duty',
        description: 'Feeds the dispatch pool directly.',
        security: bearer,
        requestBody: body('UpdateAvailabilityInput'),
        responses: { 200: ok('Availability updated successfully'), ...pick(400, 401, 403, 404) },
      },
    },
    '/ambulances': {
      post: {
        tags: ['Ambulances'],
        summary: 'Add an ambulance to the fleet',
        security: bearer,
        requestBody: body('CreateAmbulanceInput'),
        responses: { 201: ok('Ambulance created successfully'), ...pick(400, 401, 403, 409) },
      },
      get: {
        tags: ['Ambulances'],
        summary: 'List ambulances',
        description:
          'Pagination, filtering by type, status and station area, search by registration number, and sorting.',
        security: bearer,
        parameters: [
          ...paginationParams,
          { name: 'searchTerm', in: 'query', schema: { type: 'string' }, example: 'DHA' },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['BASIC', 'AC', 'ICU', 'FREEZER'] },
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE'] },
          },
          { name: 'stationArea', in: 'query', schema: { type: 'string' }, example: 'Gulshan' },
        ],
        responses: { 200: paginated('Ambulances retrieved successfully'), ...pick(401, 403) },
      },
    },
    '/ambulances/{id}': {
      get: {
        tags: ['Ambulances'],
        summary: 'Get an ambulance by id',
        security: bearer,
        parameters: [uuidParam('id', 'Ambulance id')],
        responses: { 200: ok('Ambulance retrieved successfully'), ...pick(401, 403, 404) },
      },
      patch: {
        tags: ['Ambulances'],
        summary: 'Update ambulance details',
        security: bearer,
        parameters: [uuidParam('id', 'Ambulance id')],
        requestBody: body('UpdateAmbulanceInput'),
        responses: { 200: ok('Ambulance updated successfully'), ...pick(400, 401, 403, 404, 409) },
      },
      delete: {
        tags: ['Ambulances'],
        summary: 'Soft delete an ambulance',
        security: bearer,
        parameters: [uuidParam('id', 'Ambulance id')],
        responses: { 200: ok('Ambulance deleted successfully'), ...pick(401, 403, 404, 409) },
      },
    },
    '/ambulances/{id}/status': {
      patch: {
        tags: ['Ambulances'],
        summary: 'Change ambulance status',
        description: 'ADMIN or DRIVER. Writes an audit log entry.',
        security: bearer,
        parameters: [uuidParam('id', 'Ambulance id')],
        requestBody: body('UpdateAmbulanceStatusInput'),
        responses: {
          200: ok('Ambulance status updated successfully'),
          ...pick(400, 401, 403, 404, 409),
        },
      },
    },
    '/hospitals': {
      post: {
        tags: ['Hospitals'],
        summary: 'Add a hospital',
        security: bearer,
        requestBody: body('CreateHospitalInput'),
        responses: { 201: ok('Hospital created successfully'), ...pick(400, 401, 403) },
      },
      get: {
        tags: ['Hospitals'],
        summary: 'List hospitals',
        description: 'Any authenticated role. Search by name, filter by area and specialization.',
        security: bearer,
        parameters: [
          ...paginationParams,
          { name: 'searchTerm', in: 'query', schema: { type: 'string' } },
          { name: 'area', in: 'query', schema: { type: 'string' }, example: 'Gulshan' },
          { name: 'specialization', in: 'query', schema: { type: 'string' }, example: 'ICU' },
        ],
        responses: { 200: paginated('Hospitals retrieved successfully'), ...pick(401) },
      },
    },
    '/hospitals/{id}': {
      get: {
        tags: ['Hospitals'],
        summary: 'Get a hospital by id',
        security: bearer,
        parameters: [uuidParam('id', 'Hospital id')],
        responses: { 200: ok('Hospital retrieved successfully'), ...pick(401, 404) },
      },
      patch: {
        tags: ['Hospitals'],
        summary: 'Update a hospital',
        security: bearer,
        parameters: [uuidParam('id', 'Hospital id')],
        requestBody: body('UpdateHospitalInput'),
        responses: { 200: ok('Hospital updated successfully'), ...pick(400, 401, 403, 404) },
      },
      delete: {
        tags: ['Hospitals'],
        summary: 'Soft delete a hospital',
        security: bearer,
        parameters: [uuidParam('id', 'Hospital id')],
        responses: { 200: ok('Hospital deleted successfully'), ...pick(401, 403, 404) },
      },
    },
    '/emergency-requests': {
      post: {
        tags: ['Emergency Requests'],
        summary: 'Raise an emergency request',
        description: 'PATIENT only. One live request per patient at a time.',
        security: bearer,
        requestBody: body('CreateEmergencyRequestInput'),
        responses: { 201: ok('Emergency request created successfully'), ...pick(400, 401, 403, 409) },
      },
      get: {
        tags: ['Emergency Requests'],
        summary: 'List emergency requests',
        description: 'ADMIN sees every request, PATIENT sees only their own.',
        security: bearer,
        parameters: [
          ...paginationParams,
          { name: 'searchTerm', in: 'query', schema: { type: 'string' } },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['PENDING', 'DISPATCHED', 'COMPLETED', 'CANCELLED', 'NO_AMBULANCE_AVAILABLE'],
            },
          },
          {
            name: 'priority',
            in: 'query',
            schema: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
          },
        ],
        responses: { 200: paginated('Emergency requests retrieved successfully'), ...pick(401) },
      },
    },
    '/emergency-requests/{id}': {
      get: {
        tags: ['Emergency Requests'],
        summary: 'Get an emergency request by id',
        security: bearer,
        parameters: [uuidParam('id', 'Emergency request id')],
        responses: { 200: ok('Emergency request retrieved successfully'), ...pick(401, 403, 404) },
      },
      patch: {
        tags: ['Emergency Requests'],
        summary: 'Edit a pending request',
        description: 'Only while the request is still PENDING.',
        security: bearer,
        parameters: [uuidParam('id', 'Emergency request id')],
        requestBody: body('UpdateEmergencyRequestInput'),
        responses: {
          200: ok('Emergency request updated successfully'),
          ...pick(400, 401, 403, 404, 409),
        },
      },
    },
    '/emergency-requests/{id}/cancel': {
      patch: {
        tags: ['Emergency Requests'],
        summary: 'Cancel a pending request',
        security: bearer,
        parameters: [uuidParam('id', 'Emergency request id')],
        requestBody: body('CancelInput'),
        responses: {
          200: ok('Emergency request cancelled successfully'),
          ...pick(400, 401, 403, 404, 409),
        },
      },
    },
    '/emergency-requests/{id}/dispatch': {
      post: {
        tags: ['Emergency Requests'],
        summary: 'Dispatch an ambulance',
        description:
          'ADMIN only. Runs in a transaction: claims the request, ambulance and driver with conditional updates, then creates the trip. A race that loses rolls the whole thing back. Writes an audit log entry.',
        security: bearer,
        parameters: [uuidParam('id', 'Emergency request id')],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DispatchInput' } } },
        },
        responses: { 200: ok('Ambulance dispatched successfully'), ...pick(400, 401, 403, 404, 409) },
      },
    },
    '/trips': {
      get: {
        tags: ['Trips'],
        summary: 'List all trips',
        description: 'ADMIN only. Filter by status, driver and dispatch date range.',
        security: bearer,
        parameters: [
          ...paginationParams,
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'DISPATCHED',
                'EN_ROUTE_TO_PICKUP',
                'PATIENT_PICKED_UP',
                'EN_ROUTE_TO_HOSPITAL',
                'ARRIVED_AT_HOSPITAL',
                'COMPLETED',
                'CANCELLED',
              ],
            },
          },
          { name: 'driverId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'from', in: 'query', schema: { type: 'string' }, example: '2026-09-01' },
          { name: 'to', in: 'query', schema: { type: 'string' }, example: '2026-09-30' },
        ],
        responses: { 200: paginated('Trips retrieved successfully'), ...pick(401, 403) },
      },
    },
    '/trips/me': {
      get: {
        tags: ['Trips'],
        summary: 'Your assignments or your history',
        description: 'DRIVER sees assigned trips, PATIENT sees their own trip history.',
        security: bearer,
        parameters: [...paginationParams, { name: 'status', in: 'query', schema: { type: 'string' } }],
        responses: { 200: paginated('Trips retrieved successfully'), ...pick(401, 403) },
      },
    },
    '/trips/{id}': {
      get: {
        tags: ['Trips'],
        summary: 'Get a trip by id',
        description: 'The assigned driver, the patient on the trip, or an admin.',
        security: bearer,
        parameters: [uuidParam('id', 'Trip id')],
        responses: { 200: ok('Trip retrieved successfully'), ...pick(401, 403, 404) },
      },
    },
    '/trips/{id}/status': {
      patch: {
        tags: ['Trips'],
        summary: 'Advance the trip state machine',
        description:
          'Legal moves only: DISPATCHED to EN_ROUTE_TO_PICKUP to PATIENT_PICKED_UP to EN_ROUTE_TO_HOSPITAL to ARRIVED_AT_HOSPITAL, plus CANCELLED. Completion has its own endpoint. Heading to a hospital requires one to be selected first.',
        security: bearer,
        parameters: [uuidParam('id', 'Trip id')],
        requestBody: body('UpdateTripStatusInput'),
        responses: { 200: ok('Trip status updated successfully'), ...pick(400, 401, 403, 404, 409) },
      },
    },
    '/trips/{id}/hospital': {
      patch: {
        tags: ['Trips'],
        summary: 'Choose the destination hospital',
        description: 'Allowed any time before the ambulance arrives.',
        security: bearer,
        parameters: [uuidParam('id', 'Trip id')],
        requestBody: body('SelectHospitalInput'),
        responses: {
          200: ok('Destination hospital selected successfully'),
          ...pick(400, 401, 403, 404, 409),
        },
      },
    },
    '/trips/{id}/complete': {
      patch: {
        tags: ['Trips'],
        summary: 'Complete the trip and settle the fare',
        description:
          'Only from ARRIVED_AT_HOSPITAL. One transaction: trip to COMPLETED with the fare, ambulance back to AVAILABLE, driver back on duty, request to COMPLETED, and a PENDING payment raised.',
        security: bearer,
        parameters: [uuidParam('id', 'Trip id')],
        requestBody: body('CompleteTripInput'),
        responses: { 200: ok('Trip completed successfully'), ...pick(400, 401, 403, 404, 409) },
      },
    },
    '/payments/init/{tripId}': {
      post: {
        tags: ['Payments'],
        summary: 'Open an SSLCommerz checkout session',
        description:
          'PATIENT only, on their own completed and unpaid trip. Issues a fresh transaction id, stores it before redirecting, and returns the gateway checkout URL.',
        security: bearer,
        parameters: [uuidParam('tripId', 'Trip id')],
        responses: {
          200: ok('Payment session created successfully', {
            transactionId: 'RA-MTQ1NH1W-F2F4D4DC',
            amount: '675.00',
            status: 'PENDING',
            gatewayPageURL: 'https://sandbox.sslcommerz.com/EasyCheckOut/...',
          }),
          ...pick(400, 401, 403, 404, 409),
        },
      },
    },
    '/payments/success': {
      post: {
        tags: ['Payments'],
        summary: 'Gateway success callback',
        description:
          'Public, posted by SSLCommerz as form data. Re-validates the val_id server side and checks status, transaction id, currency and amount against the gateway before marking the bill PAID. A repeat callback is a no-op.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/x-www-form-urlencoded': {
              schema: { $ref: '#/components/schemas/GatewayCallback' },
            },
          },
        },
        responses: {
          200: ok('Payment confirmed successfully'),
          402: {
            description: 'The gateway refused to validate this payment',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          ...pick(400, 404),
        },
      },
    },
    '/payments/fail': {
      post: {
        tags: ['Payments'],
        summary: 'Gateway failure callback',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/x-www-form-urlencoded': {
              schema: { $ref: '#/components/schemas/GatewayCallback' },
            },
          },
        },
        responses: { 200: ok('Payment failed'), ...pick(400, 404) },
      },
    },
    '/payments/cancel': {
      post: {
        tags: ['Payments'],
        summary: 'Gateway cancellation callback',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/x-www-form-urlencoded': {
              schema: { $ref: '#/components/schemas/GatewayCallback' },
            },
          },
        },
        responses: { 200: ok('Payment cancelled by the patient'), ...pick(400, 404) },
      },
    },
    '/payments/ipn': {
      post: {
        tags: ['Payments'],
        summary: 'Instant Payment Notification',
        description:
          'Server to server, retried by SSLCommerz until it sees a 200. Settles the bill on its own when the browser redirect never arrives, and is idempotent with it.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/x-www-form-urlencoded': {
              schema: { $ref: '#/components/schemas/GatewayCallback' },
            },
          },
        },
        responses: { 200: ok('IPN processed'), ...pick(400, 404) },
      },
    },
  }),
};
