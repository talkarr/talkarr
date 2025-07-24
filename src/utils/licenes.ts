import type { LicenseList } from '@components/LicenseViewer';

import licenses from '@backend/licenses.json';

const formatName = (name: string): string => {
    const formattedName = name.startsWith('@') ? name.slice(1) : name;
    return formattedName.toLowerCase();
};

export const licenseList: LicenseList = licenses.toSorted((a, b) => {
    const nameA = formatName(a.name);
    const nameB = formatName(b.name);
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;

    if (a.version && b.version) {
        return a.version.localeCompare(b.version);
    }

    return 0;
});
