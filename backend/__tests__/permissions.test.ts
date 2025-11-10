import {
    checkPermissions,
    createUserPermissions,
    Permission,
} from '@backend/permissions';

describe('permissions', () => {
    test('A user with admin permissions should be able to do everything', () => {
        const userPermissions = createUserPermissions(Permission.Admin);

        let loopCount = 0;

        for (const permission of Object.values(Permission)) {
            expect(
                checkPermissions({ permissions: userPermissions }, permission),
            ).toBe(true);
            loopCount += 1;
        }

        expect(loopCount).toBeGreaterThan(0);
    });
});
