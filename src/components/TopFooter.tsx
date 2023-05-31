import React, { FC } from 'react';
import { Grid } from '@mui/material';
import instagram_svg from './images/Instagram.svg';
import twitter_svg from './images/Twitter.svg';
import facebook_svg from './images/Facebook.svg';
import youtube_svg from './images/Youtube.svg';
import linkedin_svg from './images/LinkedIn.svg';

class TopFooter extends React.Component {

    render() {
        return (
            <div id="top-footer">
                <Grid  container direction = "row" justifyContent="space-between" alignItems="flex-start"  spacing={0}>
                    <Grid  item = {true} xs={8}>
                        1
                    </Grid>
                    <Grid  item = {true} xs={4}>
                        2
                    </Grid>
                    <Grid  item = {true} xs={4}>
                        3
                    </Grid>
                    <Grid  item = {true} xs={8}>
                        4
                    </Grid>
                </Grid>
            </div>
        )

    }
}

export default TopFooter;