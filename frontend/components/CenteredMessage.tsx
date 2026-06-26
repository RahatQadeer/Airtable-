import React from 'react';
import {Heading, Icon, Text} from '@airtable/blocks/ui';

/** Icon names accepted by the Airtable `Icon` component. */
type IconNameProp = React.ComponentProps<typeof Icon>['name'];

interface CenteredMessageProps {
    title?: string;
    icon?: IconNameProp;
    tone?: 'info' | 'error';
    children?: React.ReactNode;
}

/** Full-width centered notice used for gating/empty/coming-soon states. */
export function CenteredMessage({
    title,
    icon,
    tone = 'info',
    children,
}: CenteredMessageProps) {
    return (
        <div className={`centered centered--${tone}`}>
            <div className="centered__inner">
                {icon && (
                    <div className="centered__icon">
                        <Icon name={icon} size={26} />
                    </div>
                )}
                {title && <Heading className="centered__title">{title}</Heading>}
                {children && <Text className="centered__text">{children}</Text>}
            </div>
        </div>
    );
}
