import type { Outcome } from '@/apps/work-flow/model/flow';

export function generateOutcomeByName(outcomeName: string, outcomes: Outcome[]) {
  const nameExisted = outcomes.map(e => e.name);
  const newOutcome: Outcome = {
    name: outcomeName,
    label: outcomeName,
    required: []
  };
  if (!nameExisted.includes(outcomeName)) {
    return newOutcome;
  } else {
    let stt = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      newOutcome.name = `${outcomeName} ${stt}`;
      newOutcome.label = `${outcomeName} ${stt}`;
      if (!nameExisted.includes(newOutcome.name)) {
        return newOutcome;
      } else {
        stt++;
      }
    }
  }

}