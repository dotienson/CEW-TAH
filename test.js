import { calculateZScore } from '@pedi-growth/core';
async function run() {
  const result = await calculateZScore({
    indicator: 'bmi-for-age',
    sex: 'male',
    ageInDays: 61 * 30.4375,
    measurement: 15.3
  });
  console.log(result);
}
run();
