import { helpers } from '@vuelidate/validators';

import { DateTimeFormat } from '@/common/constants';
import useMoment from '@/common/helpers/mixins/use-moment';

export function minLengthCustom(length: number, errorMessage?: string) {
  return helpers.withMessage(
    errorMessage || `Tối thiểu ${length} ký tự`,
    helpers.withParams({
      type: 'minLength',
      min: length
    }, (value, siblingState, vm) => {
      if (siblingState == null) {
        return true;
      } // Cho phép giá trị rỗng, sẽ được required xử lý
      return String(siblingState).length >= length;
    })
  );
}

export function maxLengthCustom(length: number, errorMessage?: string) {
  return helpers.withMessage(
    errorMessage || `Tối đa ${length} ký tự`,
    helpers.withParams({
      type: 'maxLength',
      max: length
    }, (value, siblingState, vm) => {
      if (siblingState == null) {
        return true;
      }
      return String(siblingState).length <= length;
    })
  );
}

export function minValueCustom(min: number, errorMessage?: string) {
  return helpers.withMessage(
    errorMessage || `Giá trị tối thiểu là ${min}`,
    helpers.withParams({
      type: 'minValue',
      min
    }, (value, siblingState, vm) => {
      if (siblingState == null) {
        return true;
      }
      return Number(siblingState) >= min;
    })
  );
}

export function maxValueCustom(max: number, errorMessage?: string) {
  return helpers.withMessage(
    errorMessage || `Giá trị tối đa là ${max}`,
    helpers.withParams({
      type: 'maxValue',
      max
    }, (value, siblingState, vm) => {
      if (siblingState == null) {
        return true;
      }
      return Number(siblingState) <= max;
    })
  );
}

export function regexCustom(pattern: string | RegExp, errorMessage?: string) {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

  return helpers.withMessage(
    errorMessage || 'Giá trị không đúng định dạng',
    helpers.withParams({
      type: 'pattern',
      pattern: regex
    }, (value, siblingState, vm) => {
      if (siblingState == null || siblingState === '') {
        return true;
      } // Bỏ qua nếu không phải required
      return regex.test(String(siblingState));
    })
  );
}

export const dateBefore = (targetDate: string | Date | undefined | null, errorMessage?: string) => {
  const { moment } = useMoment();
  return helpers.withMessage(
    errorMessage || `Ngày phải trước ${moment(targetDate).format(DateTimeFormat.DATE_READABLE)}`,
    helpers.withParams({
      type: 'before',
      targetDate
    }, (value, siblingState, vm) => {
      if (!siblingState || !targetDate) {
        return true;
      }
      return moment(siblingState) < moment(targetDate);
    })
  );
};

export const dateAfter = (targetDate: string | Date | undefined | null, errorMessage?: string) => {
  const { moment } = useMoment();
  return helpers.withMessage(
    errorMessage || `Ngày phải sau ${moment(targetDate).format(DateTimeFormat.DATE_READABLE)}`,
    helpers.withParams({
      type: 'after',
      targetDate
    }, (value, siblingState, vm) => {
      if (!siblingState || !targetDate) {
        return true;
      }
      return moment(siblingState) > moment(targetDate);
    })
  );
};