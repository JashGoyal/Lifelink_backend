// Welcome
exports.welcomeTemplate = (name) => `
<h2>❤️ Welcome ${name}</h2>
<p>You are successfully registered.</p>
`;

// Admin Pending
exports.adminPendingTemplate = (name) => `
<h2>⏳ Request Pending</h2>
<p>Hello ${name}, your admin request is under review.</p>
`;

// Admin Approved
exports.adminApprovedTemplate = (name) => `
<h2 style="color:green;">✅ Approved</h2>
<p>Hello ${name}, you are now an admin.</p>
`;

// Admin Rejected
exports.adminRejectedTemplate = (name) => `
<h2 style="color:red;">❌ Rejected</h2>
<p>Hello ${name}, your request was rejected.</p>
`;

// Blood Request
exports.bloodRequestTemplate = (name, bloodGroup) => `
<h2>🚨 Blood Needed</h2>
<p>Hello ${name}, ${bloodGroup} blood is needed nearby.</p>
`;

// Donor Accepted
exports.donorAcceptedTemplate = (name) => `
<h2>✅ Donor Accepted</h2>
<p>Hello ${name}, a donor accepted your request.</p>
`;

// Request Completed
exports.requestCompletedTemplate = (name) => `
<h2>🎉 Completed</h2>
<p>Hello ${name}, your request is completed.</p>
`;