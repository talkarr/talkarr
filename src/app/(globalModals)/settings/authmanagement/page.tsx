import type { Metadata, NextPage } from "next";

import { getConfig } from "@/app/_api/settings/authmanagement";
import FolderRow from "@/app/(globalModals)/settings/authmanagement/_components/FolderRow";

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

export const metadata: Metadata = {
    title: "Authmanagement Settings",
};

const Page: NextPage = async () => {
    // const config = await getConfig();

    // const data = config?.success ? config.data : null;

    return (
        <Box data-testid="auth-management-settings">
            <Box>
                <Typography variant="h3">Auth settings</Typography>
                <Typography variant="body1">
                    Configure the OpenID Connect (OIDC) settings for your
                    application. You need to provide a client ID and the URL of
                    your Identity Provider (IDP), from which the IDP settings
                    will be fetched automatically using the OpenID Connect
                    Discovery mechanism. A client secret is not required, as
                    we&apos;re using PKCE (Proof Key for Code Exchange) for
                    authentication.
                </Typography>

                {/* A key-value section for IDP url and App ID */}
                <div
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}
                >
                    <Box>
                        <Typography variant="h4">IDP URL</Typography>
                        <Typography variant="body1">
                            The URL of your Identity Provider (IDP).
                        </Typography>
                    </Box>
                    <Box>
                        <input
                            type="text"
                            placeholder="https://example.com  [/.well-known/openid-configuration]"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography variant="h4">App ID</Typography>
                        <Typography variant="body1">
                            The client ID of your application.
                        </Typography>
                    </Box>
                    <Box>
                        <input
                            type="text"
                            placeholder="2342342342342353646435"
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                            }}
                        />
                    </Box>
                </div>
            </Box>
        </Box>
    );
};

export default Page;
