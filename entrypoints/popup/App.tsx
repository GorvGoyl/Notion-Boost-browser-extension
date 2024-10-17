import { Dispatch, SetStateAction } from 'react';

import { Page } from './main';
import { SettingsTable } from '@/components/SettingsTable';

function Home({ setPageToShow }: { setPageToShow: Dispatch<SetStateAction<Page>> }) {
    return (
        <div>
            <div className="wrapper">
                <div>
                    <div
                        role="button"
                        tabIndex={0}
                        className="title"
                        onClick={() => {
                            window.open('https://gourav.io/notion-boost', '_blank');
                        }}>
                        Notion Boost
                    </div>
                </div>

                <SettingsTable />
                <div className="footer topline">
                    <a
                        className="footer-item"
                        href="https://gourav.io/notion-boost#-currently-added-features"
                        target="_blank"
                        rel="noopener noreferrer">
                        <div
                            className="button"
                            role="button"
                            tabIndex={0}>
                            Features info <NewTabIcon />
                        </div>
                    </a>
                    {/* <a className="footer-item" href={twitterShareTxt} target="_blank">
              <div className="button" style="" role="button" tabIndex={0}>
                Share 
                <span className="twitter" />
              </div>
            </a> */}
                    <div
                        className="footer-item"
                        onClick={() => setPageToShow('about')}>
                        <div
                            className="button"
                            role="button"
                            tabIndex={0}>
                            About
                            {/* <AboutIcon /> */}
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        paddingTop: '10px',
                        borderTop: '1px solid rgb(55 53 47 / 10%)',
                        marginTop: '10px',
                    }}>
                    <a
                        style={styles.link}
                        href="https://chatgptwriter.ai?ref=notionboost"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="ChatGPT Writer">
                        ChatGPT Writer
                    </a>
                    <span style={styles.smallGreyText}> - Let AI write emails and messages for you</span>
                </div>
            </div>
        </div>
    );
}

export default Home;

// #endregion

// #region ## ----------------- ICONS ----------------- ##

function NewTabIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            style={{ marginLeft: '5px' }}
            fill="currentColor"
            viewBox="0 0 24 24">
            <path d="M18 23H4c-1.654 0-3-1.346-3-3V6c0-1.654 1.346-3 3-3h8a1 1 0 110 2H4c-.551 0-1 .448-1 1v14c0 .552.449 1 1 1h14c.551 0 1-.448 1-1v-8a1 1 0 112 0v8c0 1.654-1.346 3-3 3z" />
            <path d="M22 1h-6a1 1 0 00-.707 1.707L17.586 5l-7.293 7.293a.999.999 0 101.414 1.414L19 6.414l2.293 2.293A1 1 0 0023 8V2a1 1 0 00-1-1z" />
        </svg>
    );
}

// #endregion

export const styles = {
    link: {
        textDecoration: 'underline',
        color: '#37352f80',
        lineHeight: '1.2',
        fontSize: '13px',
        cursor: 'pointer',
    },
    smallGreyText: {
        color: '#37352f80',
        lineHeight: '1.2',
        fontSize: '12px',
    },
};
