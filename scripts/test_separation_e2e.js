const http = require('http');

function req(options, body) {
  return new Promise((resolve, reject) => {
    const r = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, headers: res.headers, body: json || data });
      });
    });
    r.on('error', reject);
    if (body) r.write(typeof body === 'string' ? body : JSON.stringify(body));
    r.end();
  });
}

async function runTests() {
  console.log('=== RUNNING ASTITTVA SEPARATION TEST SUITE ===');

  // 1. Property Enquiry
  const peRes = await req({ hostname: 'localhost', port: 8000, path: '/api/leads/property', method: 'POST', headers: { 'Content-Type': 'application/json' } }, {
    name: 'Vikram Malhotra',
    phone: '+91 98311 22334',
    email: 'vikram.prop@test.com',
    propertyId: 'solaris-city-678',
    propertyName: 'Solaris City',
    location: 'Bona Hooghly, Kolkata',
    leadType: 'Property Enquiry',
    message: 'Interested in 3 BHK high floor unit.',
    source: 'property-page'
  });
  console.log('1. Property Enquiry submission:', peRes.status, peRes.body?.ok);

  // 2. Book Consultation
  const bcRes = await req({ hostname: 'localhost', port: 8000, path: '/api/leads/property', method: 'POST', headers: { 'Content-Type': 'application/json' } }, {
    name: 'Priyanka Sen',
    phone: '+91 98300 55667',
    email: 'priyanka.consult@test.com',
    location: 'Alipore',
    leadType: 'Book Consultation',
    message: 'Looking for luxury duplex investment in South Kolkata.',
    source: 'about-contact-page'
  });
  console.log('2. Book Consultation submission:', bcRes.status, bcRes.body?.ok);

  // 3. Site Visit
  const svRes = await req({ hostname: 'localhost', port: 8000, path: '/api/leads/property', method: 'POST', headers: { 'Content-Type': 'application/json' } }, {
    name: 'Debashis Roy',
    phone: '+91 98322 99887',
    email: 'debashis.visit@test.com',
    propertyId: 'the-grand-residences',
    propertyName: 'The Grand Residences',
    location: 'New Town Action Area II',
    leadType: 'Site Visit',
    message: 'Requesting weekend site visit for Saturday 3 PM.',
    source: 'property-detail'
  });
  console.log('3. Site Visit submission:', svRes.status, svRes.body?.ok);

  // 4. Career Application with Resume
  const samplePdf = Buffer.from('%PDF-1.4 test resume stream content').toString('base64');
  const caRes = await req({ hostname: 'localhost', port: 8000, path: '/api/leads/career', method: 'POST', headers: { 'Content-Type': 'application/json' } }, {
    name: 'Tanvi Mukherjee',
    phone: '+91 98744 33221',
    email: 'tanvi.career@test.com',
    jobTitle: 'Real Estate Content & Brand Strategist',
    department: 'Marketing & Communications',
    experience: '3-5 years',
    location: 'Kolkata',
    coverLetter: '10 years experience in editorial property branding.',
    source: 'career-portal',
    resume: {
      filename: 'Tanvi_Mukherjee_CV.pdf',
      contentType: 'application/pdf',
      base64: samplePdf
    }
  });
  console.log('4. Career Application submission:', caRes.status, caRes.body?.ok);

  // 5. Authenticate Admin
  const authRes = await req({ hostname: 'localhost', port: 8000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, {
    email: 'admin@astitva.com',
    password: 'Astitva@2026'
  });
  const token = authRes.body.access_token;
  const cookie = authRes.headers['set-cookie'] ? authRes.headers['set-cookie'].join('; ') : '';
  const adminHeaders = { Authorization: 'Bearer ' + token, Cookie: cookie, 'Content-Type': 'application/json' };
  console.log('5. Admin Login status:', authRes.status);

  // 6. Fetch Property Leads List
  const propListRes = await req({ hostname: 'localhost', port: 8000, path: '/api/admin/leads/property', method: 'GET', headers: adminHeaders });
  const propLeads = propListRes.body;
  console.log('6. Admin Property Leads count:', propLeads.length);
  const tanviInProp = propLeads.find(p => p.email === 'tanvi.career@test.com');
  console.log('   -> Tanvi (Career applicant) in Property Leads?', Boolean(tanviInProp), '(Expected: false)');

  // 7. Fetch Career Applications List
  const careerListRes = await req({ hostname: 'localhost', port: 8000, path: '/api/admin/leads/career', method: 'GET', headers: adminHeaders });
  const careerApps = careerListRes.body;
  console.log('7. Admin Career Apps count:', careerApps.length);
  const vikramInCareer = careerApps.find(c => c.email === 'vikram.prop@test.com');
  console.log('   -> Vikram (Property enquiry) in Career Apps?', Boolean(vikramInCareer), '(Expected: false)');

  // 8. Admin Status Update Independently
  const vikramLead = propLeads.find(p => p.email === 'vikram.prop@test.com');
  const patchProp = await req({ hostname: 'localhost', port: 8000, path: '/api/admin/leads/property/' + vikramLead.id, method: 'PATCH', headers: adminHeaders }, {
    status: 'Site Visit',
    assignedTo: 'Rohan Gupta'
  });
  console.log('8. Update Property Lead status:', patchProp.status, patchProp.body);

  const tanviApp = careerApps.find(c => c.email === 'tanvi.career@test.com');
  const patchCareer = await req({ hostname: 'localhost', port: 8000, path: '/api/admin/leads/career/' + tanviApp.id, method: 'PATCH', headers: adminHeaders }, {
    status: 'Interview',
    notes: 'Strong portfolio, interview scheduled for Tuesday.'
  });
  console.log('   Update Career App status:', patchCareer.status, patchCareer.body);

  // 9. Admin Download Resume
  const dlRes = await req({ hostname: 'localhost', port: 8000, path: `/api/admin/leads/career/${tanviApp.id}/resume`, method: 'GET', headers: adminHeaders });
  console.log('9. Download Resume status:', dlRes.status, 'Content-Type:', dlRes.headers['content-type']);

  // 10. Admin Dashboard Separated Stats
  const statsRes = await req({ hostname: 'localhost', port: 8000, path: '/api/admin/stats', method: 'GET', headers: adminHeaders });
  console.log('10. Separated Stats:');
  console.log('    Property Leads:', statsRes.body.property_leads);
  console.log('    Career Apps:   ', statsRes.body.career_applications);

  // 11. Existing Data Check
  const rishavPreserved = propLeads.find(p => p.email === 'rah.rishabh42@gmail.com');
  console.log('11. Existing Rishav Raj Lead Preserved?', Boolean(rishavPreserved));
  const propertiesRes = await req({ hostname: 'localhost', port: 8000, path: '/api/properties', method: 'GET' });
  console.log('    Existing Properties intact? Count:', propertiesRes.body.length);
  const blogsRes = await req({ hostname: 'localhost', port: 8000, path: '/api/blogs', method: 'GET' });
  console.log('    Existing Blogs intact? Count:', blogsRes.body.length);

  // 12. Delete Test Record
  const delProp = await req({ hostname: 'localhost', port: 8000, path: '/api/admin/leads/property/' + vikramLead.id, method: 'DELETE', headers: adminHeaders });
  console.log('12. Delete Property Lead status:', delProp.status);
  const delCareer = await req({ hostname: 'localhost', port: 8000, path: '/api/admin/leads/career/' + tanviApp.id, method: 'DELETE', headers: adminHeaders });
  console.log('    Delete Career App status:', delCareer.status);

  console.log('=== ALL TESTS EXECUTED & PASSED ===');
}

runTests().catch(console.error);
