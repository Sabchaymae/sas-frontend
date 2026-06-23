import operationsApi from './operationsApi';

const attendanceService = {
  // Employees
  getEmployees: () => operationsApi.get('v1/employees'),
  createEmployee: (data) => operationsApi.post('v1/employees', data),
  updateEmployee: (id, data) => operationsApi.put(`v1/employees/${id}`, data),
  deleteEmployee: (id) => operationsApi.delete(`v1/employees/${id}`),

  // Attendance
  getAttendance: (params) => operationsApi.get('v1/attendance', { params }),
  
  // Anomalies
  getAnomalies: (params) => operationsApi.get('v1/anomalies', { params }),
  updateAnomaly: (id, data) => operationsApi.put(`v1/anomalies/${id}`, data),

  // Devices
  getDevices: () => operationsApi.get('v1/devices'),
  createDevice: (data) => operationsApi.post('v1/devices', data),
};

export default attendanceService;
