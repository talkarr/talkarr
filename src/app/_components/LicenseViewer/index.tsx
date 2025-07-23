import type { FC } from 'react';

import licenses from '@backend/licenses.json';

import LicenseInfo from '@components/LicenseViewer/_components/LicenseInfo';
import LicenseItem from '@components/LicenseViewer/_components/LicenseItem';
import Box from '@mui/material/Box';

export interface License {
    name: string;
    version?: string;
    license?: string;
    repository?: string;
    licenseContent?: string | null;
}

export type LicenseList = License[];

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

export interface LicenseViewerProps {
    scrollBoxHeight?: string;
}

const LicenseViewer: FC<LicenseViewerProps> = ({ scrollBoxHeight }) => (
    <Box display="flex" flexDirection="row" gap={2}>
        <Box
            flex={1}
            overflow="auto"
            display="flex"
            flexDirection="column"
            maxHeight={scrollBoxHeight}
        >
            {licenseList.map(license => (
                <LicenseItem
                    key={`${license.name}-${license.version}`}
                    license={license}
                />
            ))}
        </Box>
        <LicenseInfo maxHeight={scrollBoxHeight} />
    </Box>
);

export default LicenseViewer;
