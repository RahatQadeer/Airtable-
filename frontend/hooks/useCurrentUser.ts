/**
 * Resolves the currently logged-in Airtable collaborator against the "Users"
 * table and reports their app role.
 *
 * All Airtable access for authentication lives here so UI components can stay
 * presentational. Connects ONLY the Users table — no other tables are touched.
 *
 * Expected schema (matched case-insensitively by name):
 *   Users
 *     • Name  (single line text)  — falls back to the table's primary field
 *     • Email (email)
 *     • Role  (single select: "Employee" | "Manager")
 */

import {useBase, useRecords, useSession} from '@airtable/blocks/ui';

const USERS_TABLE_NAME = 'Users';
const EMAIL_FIELD_NAME = 'Email';
const ROLE_FIELD_NAME = 'Role';
const NAME_FIELD_NAME = 'Name';

/** The matched Users-table record for the logged-in collaborator. */
export interface RegisteredUser {
    recordId: string;
    name: string;
    email: string;
    /** Raw value of the Role single-select, e.g. "Employee" / "Manager". */
    role: string;
    /** Collaborator avatar from the Airtable session, if available. */
    avatarUrl?: string;
}

/** Discriminated union describing the lookup outcome. */
export type CurrentUserState =
    | {status: 'loading'}
    | {status: 'error'; message: string}
    | {status: 'unregistered'; email: string | null}
    | {status: 'ready'; user: RegisteredUser};

/**
 * Looks up the active collaborator in the Users table by email.
 *
 * @returns a {@link CurrentUserState} the UI can switch on.
 */
export function useCurrentUser(): CurrentUserState {
    const base = useBase();
    const session = useSession();

    // Hooks must run unconditionally; `useRecords` tolerates a null table.
    const usersTable = base.getTableByNameIfExists(USERS_TABLE_NAME);
    const records = useRecords(usersTable);

    // --- Configuration checks ------------------------------------------------
    if (!usersTable) {
        return {
            status: 'error',
            message: `A table named "${USERS_TABLE_NAME}" was not found in this base.`,
        };
    }

    const emailField = usersTable.getFieldByNameIfExists(EMAIL_FIELD_NAME);
    const roleField = usersTable.getFieldByNameIfExists(ROLE_FIELD_NAME);
    const nameField =
        usersTable.getFieldByNameIfExists(NAME_FIELD_NAME) ?? usersTable.primaryField;

    if (!emailField || !roleField) {
        return {
            status: 'error',
            message: `The "${USERS_TABLE_NAME}" table must contain "${EMAIL_FIELD_NAME}" and "${ROLE_FIELD_NAME}" fields.`,
        };
    }

    // --- Session detection ---------------------------------------------------
    const collaborator = session.currentUser;
    if (!collaborator) {
        // Session not resolved yet.
        return {status: 'loading'};
    }

    const sessionEmail = collaborator.email ? collaborator.email.trim() : null;
    if (!sessionEmail) {
        // Logged in, but the SDK didn't expose an email to match on.
        return {status: 'unregistered', email: null};
    }

    // --- Match by email (case-insensitive) -----------------------------------
    try {
        const target = sessionEmail.toLowerCase();
        const match = records.find(
            (record) =>
                record.getCellValueAsString(emailField).trim().toLowerCase() === target,
        );

        if (!match) {
            return {status: 'unregistered', email: sessionEmail};
        }

        const user: RegisteredUser = {
            recordId: match.id,
            name:
                match.getCellValueAsString(nameField).trim() ||
                collaborator.name ||
                sessionEmail,
            email: match.getCellValueAsString(emailField).trim(),
            role: match.getCellValueAsString(roleField).trim(),
            avatarUrl: collaborator.profilePicUrl,
        };

        return {status: 'ready', user};
    } catch (err) {
        return {
            status: 'error',
            message:
                err instanceof Error
                    ? err.message
                    : 'Failed to read the Users table.',
        };
    }
}
