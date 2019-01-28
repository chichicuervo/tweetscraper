import path from 'path';
import React, { Component, createRef } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme  => ({
    root: {
        width: '100%',
    },
    button: {
        margin: theme.spacing.unit / 2,
    },
    paperRoot: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
        marginTop: theme.spacing.unit * 8,
    },
    paperResult: {
        display: 'flex',
        // alignItems: 'center',
        // flexGrow: 1,
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
        marginTop: theme.spacing.unit,
        // textAlign: 'center',
        // verticalAlign: 'middle',
    },
    imgImg: {
        margin: 'auto',
    },
    searchButtonText: {
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        overflow: 'visible',
        whiteSpace: 'nowrap'
    },
    searchField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },

});

class SearchForm extends Component {

    state = {
        spinner: null,
        url: null,
        tweetData: null
    }

    doSubmit(event) {
        event.preventDefault();

        const raw_url = this.state.url;

        this.setState({
            spinner: 1,
            tweetData: null
        });

        let matches;
        if (!(matches = raw_url.match(/^(?:(?:https?:\/+)?(?:[\w\d]+\.)?twitter\.com\/([\w\d]+)\/status\/)?(\d+)/i))) {
            this.setState({spinner: -1});
            return;
        }

        const tweet_id = matches.pop();
        const uname = matches.pop();
        const fetch_url = path.join('/tweet', uname || '', uname ? 'status' : '', tweet_id);
        // console.log(tweet_id, uname, fetch_url);

        // const data = new FormData();
        // data.append('file', file, file.name);

        fetch(fetch_url, {

        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            this.setState({
                tweetData: data,
                spinner: 0
            });
        })
        .catch(err => {
            console.log(err);
            this.setState({spinner: -1});
        })
    }

    download() {
        const { tweetData } = this.state;

        if (tweetData) {
            const  a = document.createElement('a');

            a.href = 'data:application/json;charset=utf-8,' + JSON.stringify(tweetData);
            a.download = (tweetData.tweetData.tweetId || 'tweet') + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    handleChange(event) {
        this.setState({
            spinner: 0,
            url: event.target.value
        });
    }

    render() {
        const { classes, theme, children } = this.props;
        const { spinner, tweetData } = this.state;

        return  (<>
            <form onSubmit={e => this.doSubmit(e)} className={classes.root}>
                <Paper className={classes.paperRoot} >
                    <TextField fullWidth label="Tweet URL" margin="dense" variant="outlined"
                        className={classes.searchField}
                        onChange={e => this.handleChange(e)}
                    />
                    <Button variant="contained" type="submit" className={classes.button}
                        color={spinner === -1 ? 'default' : "primary"}
                        disabled={spinner === 1 || spinner === -1}
                    >
                        <Typography color="inherit" className={classes.searchButtonText} >
                            {spinner === -1 ? 'ERROR' : 'Scrape Tweet'}
                        </Typography>
                        {spinner === 1 && <CircularProgress size={24} className={classes.buttonProgress}/>}
                    </Button>
                    {tweetData && (
                        <Button variant="contained" color="primary" className={classes.button} onClick={e => this.download()}>
                            <Typography color="inherit" className={classes.searchButtonText} >
                                Download Data
                            </Typography>
                        </Button>
                    )}
                </Paper>
            </form>
            {tweetData && (<>
                {tweetData.tweetData.screenshot && (<Paper className={classes.paperResult} >
                    <img src={tweetData.tweetData.screenshot} className={classes.imgImg} />
                </Paper>)}
            </>)}
        </>);
    }

}

export default withStyles(styles, { withTheme: true })(SearchForm);
