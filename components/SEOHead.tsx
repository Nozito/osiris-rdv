import Head from 'next/head';
import React from 'react';

interface SEOHeadProps {
    title: string;
    description: string;
    canonical?: string;
    jsonLd?: object;
}

export function SEOHead({ title, description, canonical, jsonLd }: SEOHeadProps) {
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            {canonical && <link rel="canonical" href={canonical} />}
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
        </Head>
    );
}
