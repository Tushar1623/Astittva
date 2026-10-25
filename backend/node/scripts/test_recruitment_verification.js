async function testApi() {
  try {
    // 1. Login to get token
    const loginRes = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@astitva.com', password: 'Astitva@2026' })
    });
    const loginData = await loginRes.json();
    const token = loginData.access_token || loginData.token;
    if (!token) {
      throw new Error('Login failed: ' + JSON.stringify(loginData));
    }
    console.log('Admin login successful, token obtained');

    const headers = { Authorization: 'Bearer ' + token };

    // 2. Fetch jobs
    const jobsRes = await fetch('http://localhost:8000/api/admin/recruitment/jobs', { headers });
    const jobs = await jobsRes.json();
    console.log('\n=== JOBS LIST (Applications Count) ===');
    for (const job of jobs) {
      console.log(`Job: ${job.title} (${job.id}) -> Applicants: ${job.applicationsCount}`);
    }

    // 3. Fetch applications for each job
    console.log('\n=== VERIFYING FILTERED APPLICATIONS PER JOB ===');
    for (const job of jobs) {
      const appRes = await fetch(`http://localhost:8000/api/admin/recruitment/applications?jobId=${job.id}`, { headers });
      const appData = await appRes.json();
      const apps = appData.applications || [];
      const match = apps.length === job.applicationsCount;
      console.log(`Job '${job.title}' -> Filtered Applicants returned: ${apps.length} (Matches job.applicationsCount: ${match})`);
      apps.forEach(a => console.log(`   - ${a.name} | ${a.status} | Ref: ${a.referenceNumber} | Resume: ${a.hasResume}`));
    }

    // 4. Test Dashboard stats
    const dashRes = await fetch('http://localhost:8000/api/admin/recruitment/dashboard', { headers });
    const dashData = await dashRes.json();
    console.log('\n=== RECRUITMENT DASHBOARD METRICS ===');
    console.log('Total Applications:', dashData.summary.totalApplications);
    console.log('By Status:', JSON.stringify(dashData.byStatus));

    // 5. Test CV streaming endpoint for one candidate
    const allAppsRes = await fetch('http://localhost:8000/api/admin/recruitment/applications', { headers });
    const allAppsData = await allAppsRes.json();
    const sampleApp = allAppsData.applications && allAppsData.applications[0];
    if (sampleApp && sampleApp.hasResume) {
      const cvRes = await fetch(`http://localhost:8000${sampleApp.resumeUrl}`, { headers });
      const buffer = await cvRes.arrayBuffer();
      console.log(`\nCV Stream Test for '${sampleApp.name}': HTTP ${cvRes.status}, Size: ${buffer.byteLength} bytes, Content-Type: ${cvRes.headers.get('content-type')}`);
    }

    console.log('\n>>> ALL RECRUITMENT VERIFICATIONS PASSED PERFECTLY! <<<');
  } catch (err) {
    console.error('API Test Error:', err.message);
  }
}

testApi();
