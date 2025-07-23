import licenseChecker from 'license-checker';
import fs from 'fs';
import packageJson from './package.json' with { type: 'json' };

licenseChecker.init({
    start: './',
    excludePrivatePackages: true,
    relativeLicensePath: true,
    production: true,
    development: false,
    direct: true,
}, (err, packages) => {
    if (err) {
        console.error('Error generating licenses:', err);
        return;
    }

    const ourPackages = Object.keys(packageJson.dependencies || {});

    const filteredPackages = Object.entries(packages).filter(([name]) => {
        // Filter out packages that are not in our dependencies
        return ourPackages.some(pkg => name.startsWith(`${pkg}@`));
    });

    // deduplicate packages, use the latest version if multiple versions exist
    const deduplicatedPackages = new Map();
    filteredPackages.forEach(([name, info]) => {
        const regex = /(?<packageName>.*)@(?<version>[0-9.]+)$/;
        const match = name.match(regex);

        if (match) {
            const packageName = match.groups.packageName;
            const version = match.groups.version;

            if (!deduplicatedPackages.has(packageName) || deduplicatedPackages.get(packageName).version < version) {
                deduplicatedPackages.set(packageName, { ...info, version });
            }
        }
    });

    const filteredAndDedupedPackages = Array.from(deduplicatedPackages.entries()).filter(([name, info]) => {
        // Filter out packages that do not have a license or repository
        return info.licenses && info.repository && info.licenseFile;
    });

    const licenses = filteredAndDedupedPackages.map(([name, info]) => {
        const licenseContent = info.licenseFile ? fs.readFileSync(info.licenseFile, 'utf8') : null;
        const regex = /(?<packageName>.*)@(?<version>[0-9.]+)$/;
        const match = name.match(regex);

        let packageName = match ? match.groups.packageName : name;
        let version = match ? match.groups.version : info.version;

        return ({
            name: packageName,
            version,
            license: info.licenses,
            repository: info.repository,
            licenseContent: licenseContent ? licenseContent.trim() : null,
        });
    });

    console.info(`Generated licenses for ${licenses.length} packages.`);

    fs.writeFileSync('backend/licenses.json', JSON.stringify(licenses), 'utf8');
});
