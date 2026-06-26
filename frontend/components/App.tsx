import React, {useState} from 'react';
import {Icon, Loader, Text, useSettingsButton} from '@airtable/blocks/ui';
import {Header} from './Header';
import {SettingsForm} from './SettingsForm';
import {TimeTrackerApp} from './TimeTrackerApp';
import {CenteredMessage} from './CenteredMessage';
import {WelcomeScreen} from './WelcomeScreen';
import {ResolvedSettings, useSettings} from '../settings';
import {useCurrentUser} from '../hooks/useCurrentUser';

/**
 * Survives a component remount within the same session.
 *
 * Mounting the tracker triggers Airtable's record-loading suspense, which can
 * remount this component and reset its state. Keeping the "continued" flag at
 * module scope means clicking Continue isn't undone by that remount. (A module
 * variable is used instead of sessionStorage, which can throw in Airtable's
 * sandboxed iframe.)
 */
let hasContinuedGlobal = false;

/**
 * Root component.
 *
 * Authentication is the outermost layer: the logged-in collaborator is matched
 * against the Users table before anything else renders. The tracker is only
 * reachable for an "Employee"; other roles / states get a gated message.
 */
export function App() {
    const account = useCurrentUser();
    const settings = useSettings();
    const [isShowingSettings, setIsShowingSettings] = useState(false);
    const [hasContinued, setHasContinued] = useState(hasContinuedGlobal);

    useSettingsButton(() => setIsShowingSettings((value) => !value));

    const handleContinue = () => {
        hasContinuedGlobal = true;
        setHasContinued(true);
    };

    // ---- Account gating -----------------------------------------------------

    if (account.status === 'loading') {
        return (
            <div className="app app--centered">
                <div className="centered">
                    <Loader scale={0.6} />
                    <Text className="centered__text">Loading your account…</Text>
                </div>
            </div>
        );
    }

    if (account.status === 'error') {
        return (
            <div className="app app--centered">
                <CenteredMessage tone="error" icon="warning" title="Unable to load your account">
                    {account.message}
                </CenteredMessage>
            </div>
        );
    }

    if (account.status === 'unregistered') {
        return (
            <div className="app app--centered">
                <CenteredMessage tone="error" icon="warning" title="Account not registered">
                    Your account is not registered in the Users table.
                    <br />
                    Please contact your administrator.
                    {account.email ? (
                        <>
                            <br />
                            <br />
                            To register, add a row to the <strong>Users</strong> table with
                            Email <strong>{account.email}</strong> and a Role.
                        </>
                    ) : (
                        <>
                            <br />
                            <br />
                            (Your Airtable email could not be detected automatically.)
                        </>
                    )}
                </CenteredMessage>
            </div>
        );
    }

    // ---- Authenticated: confirm identity, then route by role ----------------

    const {user} = account;

    if (!hasContinued) {
        return (
            <div className="app app--centered">
                <WelcomeScreen user={user} onContinue={handleContinue} />
            </div>
        );
    }

    const role = user.role.toLowerCase();
    // Admins get full access to the tracker (the Manager view is a placeholder).
    const canUseTracker = role === 'employee' || role === 'admin' || role === 'administrator';
    const showSettings = isShowingSettings || !settings.isValid;

    let body: React.ReactNode;
    if (role === 'manager') {
        body = <CenteredMessage icon="chart" title="Manager dashboard coming soon." />;
    } else if (canUseTracker) {
        body = (
            <>
                {showSettings ? (
                    <SettingsForm
                        settings={settings}
                        onDone={() => setIsShowingSettings(false)}
                    />
                ) : (
                    <TimeTrackerApp
                        settings={settings as unknown as ResolvedSettings}
                        user={user}
                    />
                )}
                {!showSettings && (
                    <div className="app__settings-link">
                        <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => setIsShowingSettings(true)}
                        >
                            <Icon name="cog" size={14} />
                            <span>Settings</span>
                        </button>
                    </div>
                )}
            </>
        );
    } else {
        body = (
            <CenteredMessage tone="error" icon="warning" title="Role not supported">
                Your role “{user.role || 'Unknown'}” isn’t supported yet.
                <br />
                Please contact your administrator.
            </CenteredMessage>
        );
    }

    return (
        <div className="app">
            <Header userName={user.name} />
            {body}
        </div>
    );
}
