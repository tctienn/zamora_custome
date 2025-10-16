
interface HeaderCell {
  key: string
  header: string
  rowspan?: number
  colspan?: number
  frozen?: boolean
  style?: Record<string, string>
}

export interface ColumnConfig {
  key: string;
  componentType: 'input' | 'number';
  editable: boolean;
  frozen?: boolean;
  min?: number;
  max?: number;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  class?: string;
}
export const generateHeaderDepartmentLeadConfig = 
( t: (key: string, named?: Record<string, string | number>) => string, prevMonth: string, currentMonth: string): HeaderCell[][] => [
  [
    {
      key: 'stt',
      header: t('mission.note.No'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '3vw' },
      frozen: true,
    },
    {
      key: 'fullName',
      header: t('mission.note.fullName'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '15vw' },
      frozen: true,
    },
    {
      key: 'evaluatedCriteriaPrevMonth',
      header: t('hrm.evaluate.tableDepartMentLeader.evaluatedCriteriaPrevMonth', { prevMonth }),
      rowspan: 1,
      colspan: 2
    },
    {
      key: 'evaluationCurrentMonth',
      header: t('hrm.evaluate.tableDepartMentLeader.evaluationCurrentMonth', { currentMonth }),
      rowspan: 1,
      colspan: 5
    },
    {
      key: 'hrOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.hrOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
    {
      key: 'monthScore',
      header: t('hrm.evaluate.tableDepartMentLeader.monthScore'),
      rowspan: 1,
      colspan: 2
    },
    {
      key: 'assistantOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.assistantOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
    {
      key: 'vpOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.vpOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
    {
      key: 'ceoOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.ceoOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
    {
      key: 'chairmanOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.chairmanOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    }
  ],
  [
    {
      key: 'prevMonthType',
      header: t('hrm.evaluate.tableDepartMentLeader.prevMonthType'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'prevMonthScore',
      header: t('hrm.evaluate.tableDepartMentLeader.prevMonthScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week1',
      header: t('hrm.evaluate.tableDepartMentLeader.week1'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week2',
      header: t('hrm.evaluate.tableDepartMentLeader.week2'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week3',
      header: t('hrm.evaluate.tableDepartMentLeader.week3'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week4',
      header: t('hrm.evaluate.tableDepartMentLeader.week4'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'avgScore',
      header: t('hrm.evaluate.tableDepartMentLeader.avgScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'finalScoreLeader',
      header: t('hrm.evaluate.tableDepartMentLeader.finalScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'roundedScore',
      header: t('hrm.evaluate.tableDepartMentLeader.roundedScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    }
  ]
];

export const columnDepartmentLeadConfig: ColumnConfig[] = [
  {
    key: 'employeeName',
    componentType: 'input',
    editable: false,
    frozen: true,
    class: 'text-left'
  },
  {
    key: 'type',
    componentType: 'input',
    editable: true
  },
  {
    key: 'scoreOfType',
    componentType: 'number',
    editable: true
  },
  {
    key: 'scoreOfWeek1',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfWeek2',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfWeek3',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfWeek4',
    componentType: 'number',
    editable: false
  },
  {
    key: 'averageScoreOfMonthByWeek',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfBanTCNS',
    componentType: 'number',
    min: 0,
    max: 1,
    minFractionDigits: 0,
    maxFractionDigits: 3,
    editable: true
  },
  {
    key: 'scoreOfMonthByTruongBanAndBanTCNS',
    componentType: 'number',
    editable: false
  },
  {
    key: 'roundedScoreOfMonth',
    componentType: 'number',
    editable: false
  },
  {
    key: 'opinionOfBanTroLyThuKy',
    componentType: 'number',
    editable: true
  },
  {
    key: 'opinionOfPhoTGD',
    componentType: 'number',
    editable: true
  },
  {
    key: 'opinionOfTGD',
    componentType: 'number',
    editable: true
  },
  {
    key: 'opinionOfCthdqt',
    componentType: 'number',
    editable: true
  }
];
// Pho ban

export const generateHeaderDepartmentDeputyConfig = 
( t: (key: string, named?: Record<string, string | number>) => string, prevMonth: string, currentMonth: string): HeaderCell[][] => [
  [
    {
      key: 'stt',
      header: t('mission.note.No'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '3vw' },
      frozen: true
    },
    {
      key: 'fullName',
      header: t('mission.note.fullName'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '15vw' },
      frozen: true
    },
    {
      key: 'evaluatedCriteriaPrevMonth',
      header: t('hrm.evaluate.tableDepartMentLeader.evaluatedCriteriaPrevMonth', { prevMonth }),
      rowspan: 1,
      colspan: 2
    },
    {
      key: 'evaluationCurrentMonth',
      header: t('hrm.evaluate.tableDepartMentLeader.evaluationCurrentMonth', { currentMonth }),
      rowspan: 1,
      colspan: 5
    },
    {
      key: 'hrOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.hrOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
    {
      key: 'monthScore',
      header: t('hrm.evaluate.tableDepartMentLeader.monthScore'),
      rowspan: 1,
      colspan: 2
    },
    {
      key: 'assistantOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.assistantOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
    {
      key: 'vpOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.vpOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
    {
      key: 'ceoOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.ceoOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
  ],
  [
    {
      key: 'prevMonthType',
      header: t('hrm.evaluate.tableDepartMentLeader.prevMonthType'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'prevMonthScore',
      header: t('hrm.evaluate.tableDepartMentLeader.prevMonthScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week1',
      header: t('hrm.evaluate.tableDepartMentLeader.week1'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week2',
      header: t('hrm.evaluate.tableDepartMentLeader.week2'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week3',
      header: t('hrm.evaluate.tableDepartMentLeader.week3'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week4',
      header: t('hrm.evaluate.tableDepartMentLeader.week4'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'avgScore',
      header: t('hrm.evaluate.tableDepartMentLeader.avgScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'finalScoreLeader',
      header: t('hrm.evaluate.tableDepartMentLeader.finalScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'roundedScore',
      header: t('hrm.evaluate.tableDepartMentLeader.roundedScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    }
  ]
];

export const columnDepartmentDeputyConfig: ColumnConfig[] = [
  {
    key: 'employeeName',
    componentType: 'input',
    editable: false,
    frozen: true,
    class: 'text-left'
  },
  {
    key: 'type',
    componentType: 'input',
    editable: true
  },
  {
    key: 'scoreOfType',
    componentType: 'number',
    editable: true
  },
  {
    key: 'scoreOfWeek1',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfWeek2',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfWeek3',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfWeek4',
    componentType: 'number',
    editable: false
  },
  {
    key: 'averageScoreOfMonthByWeek',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfBanTCNS',
    componentType: 'number',
    editable: true,
    min: 0,
    max: 1,
    minFractionDigits: 0,
    maxFractionDigits: 3,
  },
  {
    key: 'scoreOfMonthByTruongBanAndBanTCNS',
    componentType: 'number',
    editable: false
  },
  {
    key: 'roundedScoreOfMonth',
    componentType: 'number',
    editable: false
  },
  {
    key: 'opinionOfBanTroLyThuKy',
    componentType: 'number',
    editable: true
  },
  {
    key: 'opinionOfPhoTGD',
    componentType: 'number',
    editable: true
  },
  {
    key: 'opinionOfTGD',
    componentType: 'number',
    editable: true
  },
];
// CHuyen vien

export const generateHeaderOfficersConfig = ( t: (key: string, named?: Record<string, string | number>) => string, prevMonth: string, currentMonth: string): HeaderCell[][] => [
  [
    {
      key: 'stt',
      header: t('mission.note.No'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '3vw' },
      frozen: true
    },
    {
      key: 'fullName',
      header: t('mission.note.fullName'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '15vw' },
      frozen: true
    },
    {
      key: 'evaluatedCriteriaPrevMonth',
      header: t('hrm.evaluate.tableDepartMentLeader.evaluatedCriteriaPrevMonth', { prevMonth }),
      rowspan: 1,
      colspan: 2
    },
    {
      key: 'evaluationCurrentMonth',
      header: t('hrm.evaluate.tableDepartMentLeader.evaluationCurrentMonth', { currentMonth }),
      rowspan: 1,
      colspan: 5
    },
    {
      key: 'hrOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.hrOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
    {
      key: 'monthScore',
      header: t('hrm.evaluate.tableDepartMentLeader.monthScore'),
      rowspan: 1,
      colspan: 2
    },
    {
      key: 'assistantOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.assistantOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
    {
      key: 'ceoOpinion',
      header: t('hrm.evaluate.tableDepartMentLeader.ceoOpinion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '10vw' }
    },
  ],
  [
    {
      key: 'prevMonthType',
      header: t('hrm.evaluate.tableDepartMentLeader.prevMonthType'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'prevMonth',
      header: t('hrm.evaluate.tableDepartMentLeader.prevMonth'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week1',
      header: t('hrm.evaluate.tableDepartMentLeader.week1'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week2',
      header: t('hrm.evaluate.tableDepartMentLeader.week2'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week3',
      header: t('hrm.evaluate.tableDepartMentLeader.week3'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'week4',
      header: t('hrm.evaluate.tableDepartMentLeader.week4'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'avgScore',
      header: t('hrm.evaluate.tableDepartMentLeader.avgScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'finalScoreLeader',
      header: t('hrm.evaluate.tableDepartMentLeader.finalScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    },
    {
      key: 'roundedScore',
      header: t('hrm.evaluate.tableDepartMentLeader.roundedScore'),
      style: { minWidth: '7vw' },
      colspan: 1
    }
  ]
];

export const columnOfficersConfig: ColumnConfig[] = [
  {
    key: 'employeeName',
    componentType: 'input',
    editable: false,
    frozen: true,
    class: 'text-left'
  },
  {
    key: 'type',
    componentType: 'input',
    editable: true
  },
  {
    key: 'scoreOfType',
    componentType: 'number',
    editable: true
  },
  {
    key: 'scoreOfWeek1',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfWeek2',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfWeek3',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfWeek4',
    componentType: 'number',
    editable: false
  },
  {
    key: 'averageScoreOfMonthByWeek',
    componentType: 'number',
    editable: false
  },
  {
    key: 'scoreOfBanTCNS',
    componentType: 'number',
    editable: true,
    min: 0,
    max: 1,
    minFractionDigits: 0,
    maxFractionDigits: 3,
  },
  {
    key: 'scoreOfMonthByTruongBanAndBanTCNS',
    componentType: 'number',
    editable: false
  },
  {
    key: 'roundedScoreOfMonth',
    componentType: 'number',
    editable: false
  },
  {
    key: 'opinionOfBanTroLyThuKy',
    componentType: 'number',
    editable: true
  },
  {
    key: 'opinionOfTGD',
    componentType: 'number',
    editable: true
  },
];

//Pho tong giam doc

export const generateHeaderManagerDeputyConfig = ( t: (key: string, named?: Record<string, string | number>) => string, prevMonth: string): HeaderCell[][] => [
  [
    {
      key: 'stt',
      header: t('mission.note.No'),
      rowspan: 3,
      colspan: 1,
      style: { minWidth: '3vw' },
      frozen: true
    },
    {
      key: 'positionTitle',
      header: t('hrm.evaluate.tableManagerDeputy.positionTitle'),
      rowspan: 3,
      colspan: 1,
      style: { minWidth: '15vw' },
      frozen: true
    },
    {
      key: 'evaluatedCriteriaPrevMonth',
      header: t('hrm.evaluate.tableManagerDeputy.evaluatedCriteriaPrevMonth', { prevMonth }),
      rowspan: 1,
      colspan: 2
    },
    {
      key: 'criteriaQuality',
      header: t('hrm.evaluate.tableManagerDeputy.criteriaQuality'),
      rowspan: 1,
      colspan: 4,
      style: { minWidth: '7vw' }
    },
    {
      key: 'criteriaResponsibility',
      header: t('hrm.evaluate.tableManagerDeputy.criteriaResponsibility'),
      rowspan: 1,
      colspan: 2,
      style: { minWidth: '7vw' }
    },
    {
      key: 'criteriaCompletion',
      header: t('hrm.evaluate.tableManagerDeputy.criteriaCompletion'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'totalScore',
      header: t('hrm.evaluate.tableManagerDeputy.totalScore'),
      rowspan: 1,
      colspan: 3,
      style: { minWidth: '7vw' }
    },
  ],
  [
    {
      key: 'type',
      header: t('hrm.evaluate.tableManagerDeputy.type'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'score',
      header: t('hrm.evaluate.tableManagerDeputy.score'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'levelI',
      header: t('hrm.evaluate.tableManagerDeputy.levelI'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'levelII',
      header: t('hrm.evaluate.tableManagerDeputy.levelII'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'levelIII',
      header: t('hrm.evaluate.tableManagerDeputy.levelIII'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'levelIV',
      header: t('hrm.evaluate.tableManagerDeputy.levelIV'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'notOften',
      header: t('hrm.evaluate.tableManagerDeputy.notOften'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'often',
      header: t('hrm.evaluate.tableManagerDeputy.often'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'selfEvaluate',
      header: t('hrm.evaluate.tableManagerDeputy.selfEvaluate'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'ceoEvaluate',
      header: t('hrm.evaluate.tableManagerDeputy.ceoEvaluate'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'chairmanEvaluate',
      header: t('hrm.evaluate.tableManagerDeputy.chairmanEvaluate'),
      rowspan: 2,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
  ],
  [
    {
      key: 'one',
      header: t('hrm.evaluate.tableManagerDeputy.one'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'two',
      header: t('hrm.evaluate.tableManagerDeputy.two'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'three',
      header: t('hrm.evaluate.tableManagerDeputy.three'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'four',
      header: t('hrm.evaluate.tableManagerDeputy.four'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'oneTd',
      header: t('hrm.evaluate.tableManagerDeputy.one'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'twoTd',
      header: t('hrm.evaluate.tableManagerDeputy.two'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
    {
      key: 'completionScore',
      header: t('hrm.evaluate.tableManagerDeputy.often'),
      rowspan: 1,
      colspan: 1,
      style: { minWidth: '7vw' }
    },
  ]
];

export const columnManagerDeputyConfig:ColumnConfig[] = [
  {
    key: 'employeeName',
    componentType: 'input',
    editable: false,
    frozen: true,
    class: 'text-left'
  },
  {
    key: 'type',
    componentType: 'input',
    editable: true
  },
  {
    key: 'scoreOfType',
    componentType: 'number',
    editable: true
  },
  {
    key: 'impactLevel1',
    componentType: 'number',
    editable: true
  },
  {
    key: 'impactLevel2',
    componentType: 'number',
    editable: true
  },
  {
    key: 'impactLevel3',
    componentType: 'number',
    editable: true
  },
  {
    key: 'impactLevel4',
    componentType: 'number',
    editable: true
  },
  {
    key: 'responsibilityPressureFrequency',
    componentType: 'number',
    editable: true
  },
  {
    key: 'responsibilityPressureNotFrequency',
    componentType: 'number',
    editable: true
  },
  {
    key: 'taskCompletionScore',
    componentType: 'number',
    editable: true
  },
  {
    key: 'selfEvaluationScore',
    componentType: 'number',
    editable: true
  },
  {
    key: 'ceoEvaluationScore',
    componentType: 'number',
    editable: true
  },
  {
    key: 'chairmanEvaluationScore',
    componentType: 'number',
    editable: true
  },
];
