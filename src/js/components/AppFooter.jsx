import React from 'react';

const AppFooter = () => {
    const handleGitHubClick = () => {
        window.open("https://github.com/sippinwindex", "_blank", "noopener,noreferrer");
    };

    return (
        <footer className="retro-footer">
            <div className="footer-content">
                <span>
                    Crafted with <span className="retro-heart">❤</span> by Jandry Fernandez
                </span>
                <span className="github-link-container">
                    <a
                        href="https://github.com/sippinwindex"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="SippinWindex GitHub Profile"
                        className="github-icon-link"
                        onClick={(e) => {
                            e.preventDefault();
                            handleGitHubClick();
                        }}
                    >
                        <i className="fab fa-github"></i>
                    </a>
                </span>
            </div>
            <div className="footer-c64-line">
                READY.
            </div>
        </footer>
    );
};

export default AppFooter;