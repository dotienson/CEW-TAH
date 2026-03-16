async function run() {
  const urls = [
    'https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/indicators/body-mass-index-for-age/bmi_b_0_5_zscores.txt',
    'https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/bmi-for-age-5-19-years/bmi_b_5_19_zscores.txt'
  ];
  for (const url of urls) {
    const res = await fetch(url);
    console.log(url, res.status);
  }
}
run();
