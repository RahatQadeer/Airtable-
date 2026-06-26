import React from 'react';
import {Heading, Text, Icon} from '@airtable/blocks/ui';

interface HeaderProps {
    /** Name of the currently logged-in user. */
    userName: string;
}

/** Top card showing the app brand and the logged-in user. */
export function Header({userName}: HeaderProps) {
    const initial = userName.trim().charAt(0).toUpperCase() || '?';

    return (
        <header className="card header">
            <div className="header__brand">
                <div className="header__logo">
                    <Icon name="time" size={22} />
                </div>
                <div className="header__titles">
                    <Heading className="header__heading">Employee Time Tracker</Heading>
                    <Text className="header__subtitle">Weekly timesheet overview</Text>
                </div>
            </div>

            <div className="header__user">
                <div className="header__avatar">{initial}</div>
                <div className="header__user-meta">
                    <Text className="header__user-label">Logged in as</Text>
                    <Text className="header__user-name">{userName}</Text>
                </div>
            </div>
        </header>
    );
}
