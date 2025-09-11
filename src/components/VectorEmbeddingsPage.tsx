/**
 * VectorEmbeddingsPage Component
 * 
 * Educational page about vector embeddings with an embedded interactive demonstration
 * from Claude Artifacts to help users understand this fundamental AI concept.
 */

import React from 'react';
import './VectorEmbeddingsPage.css';

interface VectorEmbeddingsPageProps {
    className?: string;
}

export const VectorEmbeddingsPage: React.FC<VectorEmbeddingsPageProps> = ({
    className = ''
}) => {
    return (
        <div className={`vector-embeddings-page ${className}`}>
            <div className="vector-embeddings-page__header">
                <h1 className="vector-embeddings-page__title">Vector Embeddings</h1>
                <p className="vector-embeddings-page__description">
                    Explore how AI systems represent and understand text, images, and other data
                    through high-dimensional mathematical vectors.
                </p>
            </div>

            <div className="vector-embeddings-page__content">
                <section className="vector-embeddings-page__overview" aria-labelledby="overview-title">
                    <h2 id="overview-title" className="vector-embeddings-page__section-title">
                        What are Vector Embeddings?
                    </h2>
                    <div className="vector-embeddings-page__text-content">
                        <p>
                            Vector embeddings are numerical representations of data that capture semantic meaning
                            in a high-dimensional space. They allow AI systems to understand relationships between
                            words, concepts, images, and other forms of data by converting them into mathematical vectors.
                        </p>
                        <p>
                            Similar concepts are positioned close together in this vector space, enabling AI models
                            to perform tasks like semantic search, recommendation systems, and natural language understanding.
                        </p>
                    </div>
                </section>

                <section className="vector-embeddings-page__interactive" aria-labelledby="interactive-title">
                    <h2 id="interactive-title" className="vector-embeddings-page__section-title">
                        Interactive Demonstration
                    </h2>
                    <p className="vector-embeddings-page__demo-description">
                        Explore how words and concepts are positioned in vector space with this interactive visualization:
                    </p>

                    <div className="vector-embeddings-page__iframe-container">
                        <iframe
                            src="https://claude.site/public/artifacts/f78fe0d2-0eb6-480f-a35a-7d1dac81760a/embed"
                            title="Vector Embeddings Interactive Demonstration"
                            width="100%"
                            height="800"
                            allow="clipboard-write"
                            allowFullScreen
                            className="vector-embeddings-page__iframe"
                        />
                    </div>
                </section>

                <section className="vector-embeddings-page__applications" aria-labelledby="applications-title">
                    <h2 id="applications-title" className="vector-embeddings-page__section-title">
                        Real-World Applications
                    </h2>
                    <div className="vector-embeddings-page__applications-grid">
                        <div className="vector-embeddings-page__application-card">
                            <h3 className="vector-embeddings-page__card-title">Search & Retrieval</h3>
                            <p className="vector-embeddings-page__card-description">
                                Find relevant documents, images, or products based on semantic similarity
                                rather than just keyword matching.
                            </p>
                        </div>

                        <div className="vector-embeddings-page__application-card">
                            <h3 className="vector-embeddings-page__card-title">Recommendation Systems</h3>
                            <p className="vector-embeddings-page__card-description">
                                Suggest content, products, or connections by understanding user preferences
                                and item relationships in vector space.
                            </p>
                        </div>

                        <div className="vector-embeddings-page__application-card">
                            <h3 className="vector-embeddings-page__card-title">Language Translation</h3>
                            <p className="vector-embeddings-page__card-description">
                                Map words and phrases across languages by positioning equivalent
                                concepts near each other in shared vector spaces.
                            </p>
                        </div>

                        <div className="vector-embeddings-page__application-card">
                            <h3 className="vector-embeddings-page__card-title">Content Classification</h3>
                            <p className="vector-embeddings-page__card-description">
                                Automatically categorize text, images, or other content by analyzing
                                their position relative to known categories in vector space.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="vector-embeddings-page__key-concepts" aria-labelledby="concepts-title">
                    <h2 id="concepts-title" className="vector-embeddings-page__section-title">
                        Key Concepts
                    </h2>
                    <div className="vector-embeddings-page__concepts-list">
                        <div className="vector-embeddings-page__concept">
                            <h3 className="vector-embeddings-page__concept-title">Dimensionality</h3>
                            <p className="vector-embeddings-page__concept-description">
                                Embeddings typically have hundreds or thousands of dimensions,
                                each capturing different aspects of meaning or features.
                            </p>
                        </div>

                        <div className="vector-embeddings-page__concept">
                            <h3 className="vector-embeddings-page__concept-title">Similarity</h3>
                            <p className="vector-embeddings-page__concept-description">
                                Distance between vectors indicates similarity - closer vectors
                                represent more similar concepts or items.
                            </p>
                        </div>

                        <div className="vector-embeddings-page__concept">
                            <h3 className="vector-embeddings-page__concept-title">Training</h3>
                            <p className="vector-embeddings-page__concept-description">
                                Embeddings are learned from large datasets, capturing patterns
                                and relationships present in the training data.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default VectorEmbeddingsPage;