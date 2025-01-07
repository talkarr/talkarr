import type { FC } from 'react';

import type { SingleTalkData } from '@/app/(globalModals)/talks/[slug]/page';

import CustomBadge from '@components/CustomBadge';
import TalkImage from '@components/TalkImage';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface TalkHeaderProps {
    data: SingleTalkData;
}

const TalkHeader: FC<TalkHeaderProps> = ({ data }) => (
    <Box paddingX={2} paddingTop={1}>
        <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            gap={2}
            flexWrap="wrap"
        >
            <Box flex={1}>
                <TalkImage data={data.db} maxWidth="100%" maxHeight="auto" />
            </Box>
            <Box flex={2} display="flex" flexDirection="column" gap={2}>
                <Typography variant="h2">{data.db.title}</Typography>
                <Box>
                    <Typography variant="body1">
                        {data.db.description}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body1">
                        {data.db.persons.join(', ')}
                    </Typography>
                </Box>
                <Box display="flex" flexDirection="row" gap={1} flexWrap="wrap">
                    {data.db.tags.map((badge, index) => (
                        <CustomBadge
                            key={`badge-${index}`}
                            badgeContent={badge}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    </Box>
);

export default TalkHeader;
