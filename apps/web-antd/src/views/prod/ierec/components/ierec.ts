export interface ElectrolyteTest {
  form_number: string;
  id: string;
  test_date: string;
  inspector: string;
  electrolyte_type: string;
  remarks: string;
  temperature: number;
  conductivity: number;
  water_data1: number;
  water_data2: number;
  water_id1: string;
  water_id2: string;
  ph: number;
  flash_voltage: number;
  measurement: string;
  verifier: string;
  overall_result: boolean;
  retest_new_solution: boolean;
  created_at: string;
  ts: string;
  equipment_no: string;
  dr: string;
}
