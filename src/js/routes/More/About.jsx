import React, { Component } from "react";
import Helmet from "react-helmet";
import { Link } from "react-router";
import ReactPlayer from "react-player";
import AnalyticsActions from "../../actions/AnalyticsActions";
import ImageHandler from "../../components/ImageHandler";
import { renderLog } from "../../utils/logging";
import OpenExternalWebSite from "../../utils/OpenExternalWebSite";
import ToolBar from "./ToolBar";
import VoterStore from "../../stores/VoterStore";
import { weVoteBoard, weVoteStaff } from "./people";

export default class About extends Component {
  constructor (props) {
    super(props);
  }

  static getProps () {
    return {};
  }

  componentDidMount () {
    AnalyticsActions.saveActionAboutMobile(VoterStore.election_id());
  }

  render () {
    renderLog(__filename);
    return <div className="about-us">
      <Helmet title="About Us - We Vote"/>
      <div className="card u-inset--md">
        <h1 className="h1">About We Vote</h1>
        <ToolBar hideGitHub />

        <div className="u-inset--sm"/>
        <ReactPlayer url="https://player.vimeo.com/video/121315141" width="300px" height="231px"/>
        <div className="our-story">
          <h3 className="h3">A Nonprofit Startup</h3>
          <p>
            We Vote is a nonpartisan nonprofit organization (501(c)(3) based in
            Oakland, California. Inspired by groups like
            <OpenExternalWebSite url="http://codeforsanfrancisco.org/"
                         target="_blank"
                         body={<span>Code for America&nbsp;<i className="fa fa-external-link" /></span>} />
            and the
            <OpenExternalWebSite url="https://www.mozilla.org/en-US/foundation/"
                         target="_blank"
                         className="open-web-site open-web-site__no-right-padding"
                         body={<span>Mozilla Foundation&nbsp;<i className="fa fa-external-link" /></span>} />
            , we use free and open source software to
          make democracy stronger by providing education about what is on your ballot.
        </p>

        <section>
          <h1 className="h1">Our Team</h1>
          <h3 className="h3">We Vote 501(c)(3) Board Members &amp; Advisers</h3>
          <div className="row">
            {
              weVoteBoard.map((item) => <div className="col-4 col-sm-3" key={item.name}>
                <div className="team-member">
                  <ImageHandler className="img-responsive team-member__photo"
                                imageUrl={item.image}
                                alt={item.name} />
                  <div className="media-body">
                    <h4 className="team-member__name"><strong>{item.name}</strong></h4>
                    <p className="team-member__title">{item.title[0]}</p>
                    <p className="xx-small hidden-xs">{item.title[1]}</p>
                  </div>
                </div>
              </div>)
            }
         </div>
          <h3 className="h3">We Vote Staff</h3>
          <div className="row">
            {
              weVoteStaff.map((item) => <div className="col-4 col-sm-3" key={item.name}>
                <div className="team-member">
                  <ImageHandler className="img-responsive team-member__photo"
                                imageUrl={item.image}
                                alt={item.name} />
                  <div className="media-body">
                    <h4 className="team-member__name"><strong>{item.name}</strong></h4>
                    <p className="team-member__title">{item.title[0]}</p>
                    <p className="xx-small hidden-xs">{item.title[1]}</p>
                  </div>
                </div>
              </div>)
            }
          </div>
        </section>

        <section>
          <h3 className="h3">Our Story</h3>
          <p>
            After meeting in Oakland in the spring of 2013, We Vote co-founders Dale McGrew, Jenifer Fernandez Ancona, Dan Ancona, and their families became fast friends and bought a home together, forming an intentional community. Through daily conversations, the idea of a nonprofit social voter network was born.
            &quot;We&#39;re living our values,&quot; says Jenifer. We Vote would be a community for voters, they
            decided, created
            from a communal home of people concerned about where this country is heading. Being an open
            source, volunteer-driven project means anyone can contribute. Kind of like democracy.
          </p>
        </section>

        <section>
          <h3 className="h3">Credits &amp; Gratitude</h3>
          <p>
            <Link to="/more/credits">We are thankful for our volunteers, our board of directors, and the organizations</Link> that are critical to our work.
          </p>
        </section>

        </div>
      </div>
    </div>;
  }
}
