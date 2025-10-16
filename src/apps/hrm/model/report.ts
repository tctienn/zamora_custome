import type { Component } from 'vue';

import LaborStructureReport from '@/apps/hrm//views/report/components/LaborStructureReport.vue';
import ChildrenOfficerReport from '@/apps/hrm/views/report/components/ChildrenOfficerReport.vue';
import ContractReport from '@/apps/hrm/views/report/components/ContractReport.vue';
import EmployeeContractTransferReport from '@/apps/hrm/views/report/components/EmployeeContractTransferReport.vue';
import EmployeeEducationReport from '@/apps/hrm/views/report/components/EmployeeEducationReport.vue';
import EmployeeResignsReport from '@/apps/hrm/views/report/components/EmployeeResignsReport.vue';
import LaborUtilizationReport from '@/apps/hrm/views/report/components/LaborUtilizationReport.vue';
import ProfessionalSkillsReport from '@/apps/hrm/views/report/components/ProfessionalSkillsReport.vue';
import RewardAll from '@/apps/hrm/views/report/components/reportVI/RewardAll.vue';
import RewardEmployee from '@/apps/hrm/views/report/components/reportVI/RewardEmployee.vue';
import RewardYear from '@/apps/hrm/views/report/components/reportVI/RewardYear.vue';
import WorkProgressReport from '@/apps/hrm/views/report/components/WorkProgressReport.vue';
import EmployeeByOrganization from '@/apps/hrm/views/report/EmployeeByOrganization.vue';

export interface SubReport {
  order: number,
  parentOrder: string,
  reportName: string,
  code: string,
  component?: Component,
}

export interface Report {
  order: string,
  reportName: string,
  code: string,
  subReport: SubReport[],
}

interface ChildrenOfficerReportPayload {
  organizationId: string;
  code: string;
  fullName: string;
  employeeId: string;
  employeeName: string;
  yearBirth: number;
  job: string;
  workUnit: string;
  relationship: string;
}

type ChildrenOfficerReportGroup = {
  orgId: string
  orgName: string
  parentCode: string | null
  employees: ChildrenOfficerReportPayload[]
}

export const dataReport: Report[] = [
  {
    order: 'I',
    reportName: 'Hồ sơ nhân sự',
    code: 'HS',
    subReport: [
      {
        order: 1,
        reportName: 'Báo cáo cơ cấu lao động',
        code: 'HS.001',
        parentOrder: 'I',
        component: LaborStructureReport
      },
      {
        order: 2,
        reportName: 'Báo cáo tổng hợp nhân sự theo cơ cấu tổ chức',
        code: 'HS.002',
        parentOrder: 'I',
        component: EmployeeByOrganization
      },
      {
        order: 3,
        reportName: 'Báo cáo thống kê danh sách lao động',
        code: 'HS.003',
        parentOrder: 'I'
      },
      {
        order: 4,
        reportName: 'Báo cáo nhân sự chuyển diện hợp đồng lao động',
        code: 'HS.004',
        parentOrder: 'I',
        component: EmployeeContractTransferReport
      },
      {
        order: 5,
        reportName: 'Báo cáo nhân sự đã nghỉ việc',
        code: 'HS.005',
        parentOrder: 'I',
        component: EmployeeResignsReport
      },
      {
        order: 6,
        reportName: 'Báo cáo nhân sự theo trình độ học vấn',
        code: 'HS.006',
        parentOrder: 'I',
        component: EmployeeEducationReport
      },
      {
        order: 7,
        reportName: 'Báo cáo quá trình công công tác của nhân sự trước khi vào công ty',
        code: 'HS.007',
        parentOrder: 'I',
        component: WorkProgressReport
      },
      {
        order: 8,
        reportName: 'Báo cáo thâm niên công tác của nhân sự',
        code: 'HS.008',
        parentOrder: 'I'
      },
      {
        order: 9,
        reportName: 'Báo cáo trích ngang con cán bộ công nhân viên',
        code: 'HS.009',
        parentOrder: 'I',
        component: ChildrenOfficerReport
      },
      {
        order: 10,
        reportName: 'Báo cáo thống kê các cháu con cán bộ dưới 16 tuổi (thiếu niên, nhi đồng)',
        code: 'HS.010',
        parentOrder: 'I'
      },
      {
        order: 11,
        reportName: 'Sổ lao động',
        code: 'HS.011',
        parentOrder: 'I'
      },
      {
        order: 12,
        reportName: 'Báo cáo thống kê lao động tăng',
        code: 'HS.012',
        parentOrder: 'I'
      },
      {
        order: 13,
        reportName: 'Báo cáo tổng hợp biến động nhân sự theo năm',
        code: 'HS.013',
        parentOrder: 'I'
      },
      {
        order: 14,
        reportName: 'Báo cáo tình hình sử dụng lao động theo mẫu Nghị định 145/2020/NĐ-CP',
        code: 'HS.014',
        parentOrder: 'I',
        component: LaborUtilizationReport
      },
      {
        order: 15,
        reportName: 'Báo cáo thống kê cán bộ nhân viên theo kỹ năng chuyên môn',
        code: 'HS.015',
        parentOrder: 'I',
        component: ProfessionalSkillsReport
      },
      {
        order: 16,
        reportName: 'Báo cáo thống kê nhân sự nghỉ không lương, nghỉ đi học, nghỉ khác',
        code: 'HS.016',
        parentOrder: 'I'
      },
      {
        order: 17,
        reportName: 'Báo cáo thống kê nhân sự đã nghỉ hưu',
        code: 'HS.017',
        parentOrder: 'I'
      },
      {
        order: 18,
        reportName: 'Báo cáo tổng hợp nhân sự theo giới tính, độ tuổi',
        code: 'HS.018',
        parentOrder: 'I'
      },
      {
        order: 19,
        reportName: 'Báo cáo tổng hợp nhân sự theo các tiêu chí chung',
        code: 'HS.019',
        parentOrder: 'I'
      },
      {
        order: 20,
        reportName: 'Biểu đồ phân tích thông tin nhân sự',
        code: 'HS.020',
        parentOrder: 'I'
      }
    ]
  },
  {
    order: 'II',
    reportName: 'Hợp đồng lao động',
    code: 'HĐ',
    subReport: [
      {
        order: 1,
        reportName: 'Báo cáo thống kê hợp đồng lao động',
        code: 'HĐ.001',
        parentOrder: 'II',
        component: ContractReport
      },
      {
        order: 2,
        reportName: 'Báo cáo tổng hợp theo loại hợp đồng',
        code: 'HĐ.002',
        parentOrder: 'II'
      },
      {
        order: 3,
        reportName: 'Báo cáo thống kê hợp đồng lao động đang hiệu lực',
        code: 'HĐ.003',
        parentOrder: 'II'
      }
    ]
  },
  {
    order: 'III',
    reportName: 'Quyết định',
    code: 'QĐ',
    subReport: [
      {
        order: 1,
        reportName: 'Báo cáo thống kế quyết định tiếp nhận',
        code: 'QĐ.001',
        parentOrder: 'III'
      },
      {
        order: 2,
        reportName: 'Báo cáo thống kê quyết định bổ nhiệm',
        code: 'QĐ.002',
        parentOrder: 'III'
      },
      {
        order: 3,
        reportName: 'Báo cáo thống kê quyết định khen thưởng',
        code: 'QĐ.003',
        parentOrder: 'III'
      },
      {
        order: 4,
        reportName: 'Báo cáo thống kê quyết định kỷ luật lao động',
        code: 'QĐ.004',
        parentOrder: 'III'
      }
    ]
  },
  {
    order: 'IV',
    reportName: 'Bảo hiểm xã hội',
    code: 'BH',
    subReport: [
      {
        order: 1,
        reportName: 'Báo cáo lao động thuộc nhóm đối tượng phải tham gia BHXH, BHYT bắt buộc nhưng chưa tham gia',
        code: 'BH.001',
        parentOrder: 'IV'
      },
      {
        order: 2,
        reportName: 'Báo cáo lao động đã tham gia BHXH, BHYT bắt buộc',
        code: 'BH.002',
        parentOrder: 'IV'
      },
      {
        order: 3,
        reportName: 'Báo cáo lao động không thuộc đối tượng phải tham gia BHXH, BHYT bắt buộc',
        code: 'BH.003',
        parentOrder: 'IV'
      },
      {
        order: 4,
        reportName: 'Báo cáo lao động thm gia trích nộp BHXH',
        code: 'BH.004',
        parentOrder: 'IV'
      },
      {
        order: 5,
        reportName: 'Báo cáo tổng hợp tham gia trích nộp BHXH theo năm',
        code: 'BH.005',
        parentOrder: 'IV'
      },
      {
        order: 6,
        reportName: 'Báo cáo tạm tính BHXH cho cán bộ, nhân viên',
        code: 'BH.006',
        parentOrder: 'IV'
      },
      {
        order: 7,
        reportName: 'Báo cáo thống kê cán bộ nhân viên tham gia BHXH',
        code: 'BH.007',
        parentOrder: 'IV'
      },
      {
        order: 8,
        reportName: 'Báo cáo tổng hợp so sánh đóng bảo hiểm theo tháng',
        code: 'BH.008',
        parentOrder: 'IV'
      },
      {
        order: 9,
        reportName: 'Báo cáo thống kê lao động tham gia BHXH, BHYT',
        code: 'BH.009',
        parentOrder: 'IV'
      },
      {
        order: 10,
        reportName: 'Báo cáo thống kê nhân sự nghỉ thai sản',
        code: 'BH.010',
        parentOrder: 'IV'
      },
      {
        order: 11,
        reportName: 'Báo cáo danh sách thanh toán chế độ ốm đau, thai sản, dưỡng sức phục hồi',
        code: 'BH.011',
        parentOrder: 'IV'
      }
    ]
  },
  {
    order: 'V',
    reportName: 'Chấm công/Phép năm',
    code: 'CP',
    subReport: [
      {
        order: 1,
        reportName: 'Bảng chấm công nhân sự theo tháng',
        code: 'CP.001',
        parentOrder: 'V'
      },
      {
        order: 2,
        reportName: 'Tổng hợp theo dõi phép năm của nhân sự',
        code: 'CP.002',
        parentOrder: 'V'
      }
    ]
  },
  {
    order: 'VI',
    reportName: 'Khen thưởng/kỷ luật lao động',
    code: 'KT',
    subReport: [
      {
        order: 1,
        reportName: 'Tổng hợp thành tích khen thưởng và danh hiệu thi đua của tập thể',
        code: 'KT.001',
        parentOrder: 'VI',
        component: RewardAll
      },
      {
        order: 2,
        reportName: 'Tổng hợp danh sách thành tích khen thưởng các năm',
        code: 'KT.002',
        parentOrder: 'VI',
        component: RewardYear
      },
      {
        order: 3,
        reportName: 'Tổng hợp thành tích khen thưởng của cá nhân',
        code: 'KT.003',
        parentOrder: 'VI',
        component: RewardEmployee
      }
    ]
  },
  {
    order: 'VII',
    reportName: 'Đào tạo',
    code: 'ĐT',
    subReport: [
      {
        order: 1,
        reportName: 'Báo cáo thống kê kết quả đào tạo',
        code: 'ĐT.001',
        parentOrder: 'VII'
      },
      {
        order: 2,
        reportName: 'Báo cáo thống kê học viên tham gia đào tạo',
        code: 'ĐT.002',
        parentOrder: 'VII'
      }
    ]
  },
  {
    order: 'VIII',
    reportName: 'Tuyển dụng',
    code: 'TD',
    subReport: [
      {
        order: 1,
        reportName: 'Báo cáo thống kê các yêu cầu tuyển dụng',
        code: 'TD.001',
        parentOrder: 'VIII'
      },
      {
        order: 2,
        reportName: 'Báo cáo tổng hợp công tác tuyển dụng',
        code: 'TD.002',
        parentOrder: 'VIII'
      },
      {
        order: 3,
        reportName: 'Báo cáo thống kê chiến dịch tuyển dụng',
        code: 'TD.003',
        parentOrder: 'VIII'
      },
      {
        order: 4,
        reportName: 'Báo cáo thống kê ứng viên tham gia ứng tuyển',
        code: 'TD.004',
        parentOrder: 'VIII'
      }
    ]
  }
];