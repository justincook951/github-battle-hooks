import React from 'react'
import PropTypes from 'prop-types'
import { fetchPopularRepos } from '../utils/api'
import { FaUser, FaStar, FaCodeBranch, FaExclamationTriangle } from 'react-icons/fa'
import Card from './Card'
import Loading from './Loading'
import Tooltip from './Tooltip'

function LanguagesNav({ selected, onUpdateLanguage }) {
    const languages = ['All', 'JavaScript', 'Ruby', 'Java', 'PHP', 'Python']
    return (
        <ul className='flex-center'>
            {languages.map((language) => (
                <li key={language}>
                    <button className='btn-clear nav-link'
                    style={language === selected ? { color: 'rgb(187, 46, 31'} : null}
                    onClick={() => onUpdateLanguage(language)}>
                        {language}
                    </button>
                </li>

            ))}
        </ul>
    )
}

LanguagesNav.propTypes = {
    selected: PropTypes.string.isRequired,
    onUpdateLanguage: PropTypes.func.isRequired
}

function ReposGrid({ repos }) {
    return (
        <ul className='grid space-around'>
            {repos.map((repo, index) => {
                const { name, owner, html_url, stargazers_count, forks, open_issues } = repo
                const { login, avatar_url } = owner

                return (
                    <li key={html_url} >
                        <Card
                            header={`#${index + 1}`}
                            avatar={avatar_url}
                            href={html_url}
                            name={login}
                        >
                            <ul className='card-list'>
                                <li>
                                    <Tooltip text="Github username">
                                        <FaUser color='rgb(255, 191, 116)' size={22} />
                                        <a href={`https://github.com/${login}`}>{login}</a>
                                    </Tooltip>
                                </li>
                                <li>
                                    <FaStar color='rgb(255, 215, 0)' size={22} />
                                    {stargazers_count.toLocaleString()} stars
                                </li>
                                <li>
                                    <FaCodeBranch color='rgb(129, 195, 245)' size={22} />
                                    {forks.toLocaleString()} forks
                                </li>
                                <li>
                                    <FaExclamationTriangle color='rgb(241, 138, 147)' size={22} />
                                    {open_issues.toLocaleString()} open issues
                                </li>
                            </ul>
                        </Card>
                    </li>
                )
            })}
        </ul>
    )    
}

ReposGrid.propTypes = {
    repos: PropTypes.array.isRequired
}

function popularReducer(state, action) {
    if (action.type === 'success') {
        return {
            ...state,
            [action.selectedLanguage]: action.repos,
            error: null
        }
    }
    else if (action.type === 'error') {
        return {
            ...state,
            error: action.error.message
        }
    }
    else {
        throw new Error('unsupported action type')
    }
}

export default function Popular() {
    const [selectedLanguage, setSelectedLanguage] = React.useState('All')
    const [state, dispatch] = React.useReducer(
        popularReducer,
        { error: null }
    )

    // Keep state, do not re-render
    const fetchedLanguages = React.useRef([])

    React.useEffect(() => {
        if (fetchedLanguages.current.includes(selectedLanguage) === false) {
            fetchedLanguages.current.push(selectedLanguage)

            fetchPopularRepos(selectedLanguage)
                .then((repos) => dispatch({ type: 'success', selectedLanguage, repos }))
                .catch((error) => dispatch({ type: 'error', error }))
        }
    }, [fetchedLanguages, selectedLanguage])

    const isLoading = () => !state[selectedLanguage] && state.error === null

    return (
        <React.Fragment>
            <LanguagesNav 
                selected={selectedLanguage}
                onUpdateLanguage={setSelectedLanguage} 
            />
            
            {isLoading() ? <Loading text='Fetching Repos' /> : null}

            {state.error ? <p className='center-text error'>{state.error}</p> : null}

            {state[selectedLanguage] ? <ReposGrid repos={state[selectedLanguage]} />: null}
        </React.Fragment>
    )
}