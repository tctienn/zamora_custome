import moment from 'moment';

import type { IAttachmentFile } from '@/apps/book-ticket/model/bookFlight';
import type { CandidateEducations, Certificates, ExtracuurricularActivities, ReferencePersons, TitlesAndAwards, WorkExperiences } from '@/apps/hrm/model/candidate';

export function createDataEducation(formData: FormData, educations: CandidateEducations[] = []){
  educations.forEach((education, index) => {
    if(!education.isCreater){
      formData.append(`candidateEducations[${index}].id`, education.id);
    }
    if(education.fromYear){
      formData.append(`candidateEducations[${index}].fromYear`, moment(education.fromYear).format('YYYY'));
    }
    if(education.toYear){
      formData.append(`candidateEducations[${index}].toYear`, moment(education.toYear).format('YYYY'));
    }
    formData.append(`candidateEducations[${index}].schoolName`, education.schoolName || '');
    formData.append(`candidateEducations[${index}].majorCode`, education.majorCode || '');
    formData.append(`candidateEducations[${index}].graduationClassification`, education.graduationClassification);
    formData.append(`candidateEducations[${index}].outstandingAchievements`, education.outstandingAchievements || '');
    formData.append(`candidateEducations[${index}].relatedSubjects`, education.relatedSubjects || '');
  });
}

export function createDataExperience(formData: FormData, experiences: WorkExperiences[] = []){
  experiences.forEach((experience, index) => {
    if(!experience.isCreater){
      formData.append(`candidateWorkExperiences[${index}].id`, experience.id);
    }
    if(experience.fromMonthYear){
      formData.append(`candidateWorkExperiences[${index}].fromMonthYear`, moment(experience.fromMonthYear).format('YYYY-MM'));
    }
    if(experience.toMonthYear){
      formData.append(`candidateWorkExperiences[${index}].toMonthYear`, moment(experience.toMonthYear).format('YYYY-MM'));
    }
    formData.append(`candidateWorkExperiences[${index}].companyName`, experience.companyName || '');
    formData.append(`candidateWorkExperiences[${index}].jobTitleCode`, experience.jobTitleCode || '');
    formData.append(`candidateWorkExperiences[${index}].jobDescription`, experience.jobDescription || '');
    formData.append(`candidateWorkExperiences[${index}].outstandingAchievements`, experience.outstandingAchievements || '');
  });
}

export function createDataExtracurricularActivity(formData: FormData, extracuurricularActivities: ExtracuurricularActivities[] = []){
  extracuurricularActivities.forEach((extracuurricular, index) => {
    if(!extracuurricular.isCreater){
      formData.append(`extracurricularActivities[${index}].id`, extracuurricular.id);
    }
    if(extracuurricular.fromMonthYear){
      formData.append(`extracurricularActivities[${index}].fromMonthYear`, moment(extracuurricular.fromMonthYear).format('YYYY-MM'));
    }
    if(extracuurricular.toMonthYear){
      formData.append(`extracurricularActivities[${index}].toMonthYear`, moment(extracuurricular.toMonthYear).format('YYYY-MM'));
    }
    formData.append(`extracurricularActivities[${index}].positionName`, extracuurricular.positionName || '');
    formData.append(`extracurricularActivities[${index}].organizationName`, extracuurricular.organizationName || '');
    formData.append(`extracurricularActivities[${index}].description`, extracuurricular.description || '');
  });
}

export function createDataCertificates(formData: FormData, certificates: Certificates[] = []){
  certificates.forEach((certificate, index) => {
    if(!certificate.isCreater){
      formData.append(`candidateCertificates[${index}].id`, certificate.id);
    }
    if(certificate.receivedIn){
      formData.append(`candidateCertificates[${index}].receivedIn`, moment(certificate.receivedIn).format('YYYY'));
    }

    formData.append(`candidateCertificates[${index}].certificateName`, certificate.certificateName || '');
  });
}

export function createDataTitlesAndAwards(formData: FormData, titlesAndAwards: TitlesAndAwards[] = []){
  titlesAndAwards.forEach((titlesAndAward, index) => {
    if(!titlesAndAward.isCreater){
      formData.append(`candidateTitlesAndAwards[${index}].id`, titlesAndAward.id);
    }
    if(titlesAndAward.receivedIn){
      formData.append(`candidateTitlesAndAwards[${index}].receivedIn`, moment(titlesAndAward.receivedIn).format('YYYY'));
    }

    formData.append(`candidateTitlesAndAwards[${index}].titleAndAwardName`, titlesAndAward.titleAndAwardName || '');
  });
}

export function createDataReferencePersons(formData: FormData, referencePersons: ReferencePersons[] = []){
  referencePersons.forEach((referencePerson, index) => {
    if(!referencePerson.isCreater){
      formData.append(`referencePersons[${index}].id`, referencePerson.id);
    }
    formData.append(`referencePersons[${index}].companyName`, referencePerson.companyName || '');
    formData.append(`referencePersons[${index}].fullName`, referencePerson.fullName || '');
    formData.append(`referencePersons[${index}].jobPositionCode`, referencePerson.jobPositionCode || '');
    formData.append(`referencePersons[${index}].email`, referencePerson.email || '');
    formData.append(`referencePersons[${index}].phoneNumber`, referencePerson.phoneNumber || '');
  });
}

export function appendAttachedFilesToFormData(formData: FormData, files: IAttachmentFile[] = []) {
  files?.forEach((file, index) => {
    const prefix = `files[${index}]`;

    formData.append(`${prefix}.quote`, file.quote);
    if (file.attachment instanceof File) {
      formData.append(`${prefix}.attachment`, file.attachment);
    }
    if (file.id) {
      formData.append(`${prefix}.id`, file.id);
    }
  });
}