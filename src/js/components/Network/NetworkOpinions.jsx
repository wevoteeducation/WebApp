import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import Helmet from "react-helmet";
import VoterGuideStore from "../../stores/VoterGuideStore";
import SearchGuidesToFollowBox from "../Search/SearchGuidesToFollowBox";
import GuideList from "../VoterGuide/GuideList";
import { renderLog } from "../../utils/logging";


export default class NetworkOpinions extends Component {
  static propTypes = {
    history: PropTypes.object,
    children: PropTypes.object,
  };

  constructor (props){
    super(props);
    this.state = {
      ballot_has_guides: VoterGuideStore.ballotHasGuides(),
      voter_guides_to_follow_all: VoterGuideStore.getVoterGuidesToFollowAll(),
    };
  }

  componentDidMount () {
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
  }

  onVoterGuideStoreChange () {
    this.setState({
      ballot_has_guides: VoterGuideStore.ballotHasGuides(),
      voter_guides_to_follow_all: VoterGuideStore.getVoterGuidesToFollowAll(),
    });
  }

  componentWillUnmount (){
    this.voterGuideStoreListener.remove();
  }

  getCurrentRoute (){
    var current_route = "/opinions";
    return current_route;
  }

  getFollowingType (){
    switch (this.getCurrentRoute()) {
      case "/opinions":
        return "WHO_YOU_CAN_FOLLOW";
      case "/opinions_followed":
      default :
        return "WHO_YOU_FOLLOW";
    }
  }

  render () {
    renderLog(__filename);
    const { ballot_has_guides, voter_guides_to_follow_all } = this.state;
    let floatRight = {
        float: "right",
    };

    return <div className="opinions-followed__container">
    <Helmet title="Listen to Organizations - We Vote" />
      <section className="card">
        <div className="card-main">
          <p className="d-print-none">
            Find opinions about your ballot (ordered by Twitter followers).
            Listen to those you trust. Stop Listening at any time.
            Listening won't add you to mailing lists.
            <span style={floatRight} className="d-print-none">
              <Link to="/opinions_followed" className="u-margin-left--md u-no-break">See organizations you listen to</Link>
            </span>
          </p>
          <div className="d-print-none">
            <SearchGuidesToFollowBox />
          </div>
          { ballot_has_guides ?
            <p /> :
            <p>There are no organizations with opinions on your ballot. Here are some popular organizations</p>
          }
          <div className="card">
            <GuideList organizationsToFollow={voter_guides_to_follow_all} instantRefreshOn />
          </div>
          <Link className="pull-right d-print-none" to="/opinions_ignored">Organizations you are ignoring</Link><br />
        </div>
      </section>
    </div>;
  }
}
