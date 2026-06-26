import React from 'react';
import {Heading, Icon, Text} from '@airtable/blocks/ui';
import {RegisteredUser} from '../hooks/useCurrentUser';

interface WelcomeScreenProps {
    user: RegisteredUser;
    onContinue: () => void;
}

/**
 * Login-style confirmation screen. Airtable authenticates the user, so this
 * isn't a credential form — it confirms the detected identity before entering
 * the app.
 */
export function WelcomeScreen({user, onContinue}: WelcomeScreenProps) {
    return (
        <div className="welcome">
            <div className="card welcome__card">
                <div className="welcome__brand">
                    <Icon name="time" size={20} className="welcome__brand-icon" />
                    <Text className="welcome__brand-text">Employee Time Tracker</Text>
                </div>

                <div className="welcome__avatar">
                    {user.avatarUrl ? (
                        <img className="welcome__avatar-img" src={user.avatarUrl} alt="" />
                    ) : (
                        <Icon name="personalAuto" size={32} />
                    )}
                </div>

                <Text className="welcome__greeting">Welcome back,</Text>
                <Heading className="welcome__name">{user.name}</Heading>

                <div className="welcome__meta">
                    <Text className="welcome__email">{user.email}</Text>
                    {user.role && <span className="welcome__role">{user.role}</span>}
                </div>

                <button
                    type="button"
                    className="btn btn--primary btn--lg welcome__btn"
                    onClick={onContinue}
                >
                    <span>Continue to Time Tracker</span>
                    <Icon name="chevronRight" size={16} />
                </button>
            </div>
        </div>
    );
}
