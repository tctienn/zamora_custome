export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

import { nextTick, ref } from 'vue';

export function useAnimateCounter() {
  const displayValue = ref(0);

  const animateCounter = (
    targetValue: number,
    duration = 1000,
    frameRate = 60,
  ) => {
    const totalFrames = Math.round(duration / 1000 * frameRate);
    const increment = targetValue / totalFrames;

    let currentValue = 0;
    let frame = 0;

    return nextTick(() => {
      const counterInterval = setInterval(() => {
        frame++;
        currentValue += increment;

        if (frame >= totalFrames || currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(counterInterval);
        }

        displayValue.value = Math.floor(currentValue);
      }, 1000 / frameRate);
    });
  };

  return {
    displayValue,
    animateCounter,
  };
}

export function getOrgAndOrgChildrenByUserId(id: string, orgs: any) {
  let result: any = null;

  orgs.forEach((org: any) => {
    const userFound = org.users?.some((user: any) => user.id === id);

    if (userFound) {
      result = [
        org,
        ...orgs.filter((childOrg: any) => childOrg.parentCode === org.code),
      ];
    }
  });

  return result;
}

export function getOrgAndOrgChildrenByOrgId(deptId: string, orgs: any) {
  let result: any = null;
  const orgParent = orgs?.find((org: any) => org.id === deptId);
  if (orgParent) {
    result = [
      orgParent,
      ...orgs.filter((childOrg: any) => childOrg.parentCode === orgParent.code),
    ];
  }
  return result;
}

export function truncateFileName(name: string) {
  if (name.length > 20) {
    return name.substring(0, 20) + '...';
  }
  return name;
}

export function convertArrayToObject(array: any) {
  return array.reduce((acc: any, item: any) => {
    acc[item] = true;
    return acc;
  }, {});
}

export function transformDeptIds(deptIds: any): string[] {
  return Object.keys(deptIds).filter((key) => deptIds[key]);
}
