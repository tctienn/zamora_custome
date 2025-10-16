import type { TreeNode } from 'primevue/treenode';

export const getAdvancedSearchTree = (t: (key: string) => string): TreeNode[] => {
  return [
    {
      key: 'profile',
      label: 'Hồ sơ nhân sự',
      value: '',
      children: [
        {
          key: 'profile.profileCode',
          label: t('hrm.profile.general.profileCode'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.personnelCode',
          label: t('hrm.profile.general.code'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.fullName',
          label: t('hrm.profile.general.fullName'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.age',
          label: t('hrm.profile.general.age'),
          value: '',
          operator: '',
          dataType: 'number'
        },
        {
          key: 'profile.dateOfBirth',
          label: t('hrm.profile.general.birthDay'),
          value: '',
          operator: '',
          dataType: 'date'
        },
        {
          key: 'profile.birthYear',
          label: t('hrm.profile.general.birthYear'),
          value: '',
          operator: '',
          dataType: 'number-date'
        },
        {
          key: 'profile.gender',
          label: t('hrm.profile.general.gender'),
          value: '',
          operator: '',
          dataType: 'multiselect'
        },
        {
          key: 'profile.otherName',
          label: t('hrm.profile.general.otherName'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.managerCode',
          label: t('hrm.profile.general.managerCode'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.checkInCode',
          label: t('hrm.profile.general.timeKeepingCode'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.startDate',
          label: t('hrm.profile.general.joinDate'),
          value: '',
          operator: '',
          dataType: 'date'
        },
        {
          key: 'profile.placeOfBirth',
          label: t('hrm.profile.general.birthPlace'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.homeTown',
          label: t('hrm.profile.general.homeTown'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.permanentResident',
          label: t('hrm.profile.general.permanentResident'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.nationality',
          label: t('hrm.profile.general.nationality'),
          value: '',
          operator: '',
          dataType: 'multiselect',
          options: []
        },
        {
          key: 'profile.ethnicity',
          label: t('hrm.profile.general.nation'),
          value: '',
          operator: '',
          dataType: 'multiselect',
          options: []
        },
        {
          key: 'profile.religion',
          label: t('hrm.profile.general.religion'),
          value: '',
          operator: '',
          dataType: 'multiselect',
        },
        {
          key: 'profile.maritalStatus',
          label: t('hrm.profile.general.maritalStatus'),
          value: '',
          operator: '',
          dataType: 'boolean'
        },
        {
          key: 'profile.isUnionMember',
          label: t('hrm.profile.general.isMember'),
          value: false,
          operator: '',
          dataType: 'boolean'
        },
        {
          key: 'profile.isPartyMember',
          label: t('hrm.profile.general.isParty'),
          value: false,
          operator: '',
          dataType: 'boolean'
        },

        // Education
        {
          key: 'profile.generalLevel',
          label: t('hrm.profile.education.generalLevel'),
          value: '',
          operator: '',
          dataType: 'multiselect'
        },
        {
          key: 'profile.informationTechnologyLevel',
          label: t('hrm.profile.education.informationTechnologyLevel'),
          value: '',
          operator: '',
          dataType: 'multiselect'
        },
        {
          key: 'profile.foreignLanguageLevel',
          label: t('hrm.profile.education.foreignLanguageLevel'),
          value: '',
          operator: '',
          dataType: 'multiselect'
        },
        {
          key: 'profile.highestLevel',
          label: t('hrm.profile.education.highestLevel'),
          value: '',
          operator: '',
          dataType: 'multiselect'
        },
        {
          key: 'profile.professionalLevel',
          label: t('hrm.profile.education.professionalLevel'),
          value: '',
          operator: '',
          dataType: 'multiselect'
        },
        {
          key: 'profile.trainingType',
          label: t('hrm.profile.education.trainingType'),
          value: '',
          operator: '',
          dataType: 'multiselect'
        },
        {
          key: 'profile.major',
          label: t('hrm.profile.education.specialized'),
          value: '',
          operator: '',
          dataType: 'multiselect'
        },
        {
          key: 'profile.currentPosition',
          label: t('hrm.profile.education.currentPosition'),
          value: '',
          operator: '',
          dataType: 'multiselect'
        },

        // Contact
        {
          key: 'profile.phoneNumber',
          label: t('hrm.profile.contact.phoneNumber'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.landline',
          label: t('hrm.profile.contact.landline'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.email',
          label: t('hrm.profile.contact.email'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.currentAddress',
          label: t('hrm.profile.contact.currentAddress'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        // {
        //   key: 'profile.currentResidence',
        //   label: t('hrm.profile.contact.currentResidence'),
        //   value: '',
        //   operator: '',
        //   dataType: 'string'
        // },

        // CCCD Passport
        {
          key: 'profile.cccdNumber',
          label: t('hrm.profile.CCCDPassport.cccdNumber'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.issueDate',
          label: t('hrm.profile.CCCDPassport.issueDate'),
          value: '',
          operator: '',
          dataType: 'date'
        },
        {
          key: 'profile.issuePlace',
          label: t('hrm.profile.CCCDPassport.issuePlace'),
          value: '',
          operator: '',
          dataType: 'string'
        },

        // Recruitment
        {
          key: 'profile.recruitmentForm',
          label: t('hrm.profile.recruitment.recruitmentForm'),
          value: '',
          operator: '',
          dataType: 'multiselect'
        },
        {
          key: 'profile.recruitmentPosition',
          label: t('hrm.profile.recruitment.recruitmentPosition'),
          value: '',
          operator: '',
          dataType: 'string'
        },

        // Bank Tax
        {
          key: 'profile.accountNumber',
          label: t('hrm.profile.bankTax.accountNumber'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.accountName',
          label: t('hrm.profile.bankTax.accountName'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'profile.personalTaxCode',
          label: t('hrm.profile.bankTax.personalTaxCode'),
          value: '',
          operator: '',
          dataType: 'string'
        },
      ]
    },
    {
      key: 'contract',
      label: 'Hợp đồng lao động',
      value: '',
      children: [
        {
          key: 'contract.contractType',
          label: t('hrm.contract.general.type'),
          value: '',
          operator: '',
          dataType: 'multiselect',
        },
        {
          key: 'contract.contractCode',
          label: t('hrm.contract.general.code'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'contract.signedDate',
          label: t('hrm.contract.general.signedDate'),
          value: '',
          operator: '',
          dataType: 'date'
        },
        {
          key: 'contract.effectiveFromDate',
          label: t('hrm.contract.general.effectiveDate'),
          value: '',
          operator: '',
          dataType: 'date'
        },
        {
          key: 'contract.effectiveToDate',
          label: t('hrm.contract.general.expiryDate'),
          value: '',
          operator: '',
          dataType: 'date'
        },
        {
          key: 'contract.signer',
          label: t('hrm.contract.general.signatory'),
          value: '',
          operator: '',
          dataType: 'multiselect',
        }
      ]
    },
    {
      key: 'insurance',
      label: 'Bảo hiểm',
      value: '',
      children: [
        {
          key: 'insurance.socialInsuranceNumber',
          label: t('hrm.insurance.codeBHXH'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'insurance.healthInsuranceCardNumber',
          label: t('hrm.insurance.cardNumBHYT'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'insurance.joinedFrom',
          label: t('hrm.insurance.socialInsuranceParticipation'),
          value: '',
          operator: '',
          dataType: 'date'
        },
        {
          key: 'insurance.cardNumBHXH',
          label: t('hrm.insurance.bookNumBHXH'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'insurance.hospitalCode',
          label: t('hrm.insurance.hospitalCode'),
          value: '',
          operator: '',
          dataType: 'string'
        },
        {
          key: 'insurance.payRate',
          label: t('hrm.insurance.paymentLevel'),
          value: '',
          operator: '',
          dataType: 'string'
        }
      ]
    }

  ];
};

// So sánh key FE ↔️ BE (EmployeeFilterSuperAdvanceInput)
// ─────────────────────────────────────────────────────
// ✅ = đúng tên
// ❌ = cần đổi tên (gợi ý tên chuẩn theo BE)
// 🚫 = không có trong BE (cần thêm hoặc loại bỏ)

// PROFILE
// profile.profileCode           ✅ profileCode
// profile.code                  ❌ → profile.personnelCode
// profile.fullName              ✅ fullName
// profile.birthDay              ❌ → profile.dateOfBirth
// profile.gender                ✅ gender
// profile.otherName             ✅ otherName
// profile.managerCode           ✅ managerCode
// profile.timeKeepingCode       ❌ → profile.checkInCode
// profile.joinDate              ❌ → profile.startDate
// profile.birthPlace            ✅ placeOfBirth
// profile.homeTown              ✅ hometown
// profile.permanentResident     ✅ permanentResidence
// profile.permanentResidentStreet 🚫 Không có trong BE
// profile.nationality           ✅ nationality
// profile.nation                ❌ → profile.ethnicity
// profile.religion              ✅ religion
// profile.maritalStatus         ✅ maritalStatus
// profile.isMember              ❌ → profile.isUnionMember
// profile.isParty               ❌ → profile.isPartyMember
// profile.generalLevel          ✅ educationLevel
// profile.highestLevel          ✅ highestAcademicLevel
// profile.professionalLevel     ✅ professionalQualification
// profile.trainingType          ✅ trainingType
// profile.specialized           ✅ major
// profile.currentPosition       ✅ currentPosition
// profile.phoneNumber           ✅ mobilePhone
// profile.landline              ✅ landlinePhone
// profile.email                 ✅ personalEmail
// profile.currentAddress        ✅ currentAddress
// profile.currentResidence      🚫 Không có trong BE
// profile.cccdNumber            ✅ citizenId
// profile.issueDate             ✅ citizenIdIssuedDate
// profile.issuePlace            ✅ citizenIdIssuedPlace
// profile.recruitmentForm       ✅ recruitmentForm
// profile.recruitmentPosition   ✅ recruitmentPosition
// profile.accountNumber         ✅ bankAccount
// profile.accountName           ✅ bankAccountName
// profile.personalTaxCode       ✅ personalTaxCode

// CONTRACT
// contract.type                 ✅ contractType
// contract.code                 ✅ contractCode
// contract.signedDate           ✅ signedDate
// contract.effectiveDate        ❌ → contract.effectiveFromDate
// contract.expiryDate           ❌ → contract.effectiveToDate
// contract.signatory            ❌ → contract.signer

// INSURANCE
// insurance.codeBHXH                   ❌ → socialInsuranceNumber
// insurance.cardNumBHYT                ✅ healthInsuranceCardNumber
// insurance.socialInsuranceParticipation ❌ → joinedFrom
// insurance.bookNumBHXH                ✅ cardNumBHXH
// insurance.hospitalCode               ✅ hospitalCode
// insurance.paymentLevel               ❌ → payRate
