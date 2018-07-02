import React, { Component } from "react";
import Helmet from "react-helmet";
import { Link } from "react-router";
import AnalyticsActions from "../../actions/AnalyticsActions";
import ImageHandler from "../../components/ImageHandler";
import { renderLog } from "../../utils/logging";
import OpenExternalWebSite from "../../utils/OpenExternalWebSite";
import VoterStore from "../../stores/VoterStore";
import { weVoteBoard, weVoteStaff } from "./people";

export default class Team extends Component {
  constructor (props) {
    super(props);
  }

  static getProps () {
    return {};
  }

  componentDidMount () {
    AnalyticsActions.saveActionAboutTeam(VoterStore.election_id());
  }

  render () {
    renderLog(__filename);
    return <div>
      <Helmet title="Team - We Vote"/>
      <div className="container-fluid card u-inset__v--md">
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
          <h3 className="h3">Credits &amp; Gratitude</h3>
          <Link to="/more/credits">We are thankful for our volunteers, our board of directors, and the
            organizations</Link> that are critical to our work.<br />
          <br />

        </section>
      </div>
    </div>;
  }
}
