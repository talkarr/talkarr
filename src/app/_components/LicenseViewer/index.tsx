import type { FC } from 'react';

import { licenseList } from '@/utils/licenes';

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
