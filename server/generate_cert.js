const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

console.log('Starting generation...');

try {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const options = { days: 365 };

    const pems = selfsigned.generate(attrs, options);

    const certsDir = path.join(__dirname, 'certs');
    if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir);
    }

    fs.writeFileSync(path.join(certsDir, 'cert.pem'), pems.cert);
    fs.writeFileSync(path.join(certsDir, 'key.pem'), pems.private);

    console.log('Certificates generated successfully!');
} catch (err) {
    console.error('Error:', err);
}
