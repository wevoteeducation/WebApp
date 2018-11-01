import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import { Link } from "react-router";
import Candidate from "./Ballot/Candidate";
import Helmet from "react-helmet";
import LoadingWheel from "../components/LoadingWheel";
import { renderLog } from "../utils/logging";
import OrganizationVoterGuide from "./VoterGuide/OrganizationVoterGuide";
import OrganizationActions from "../actions/OrganizationActions";
import PositionListForFriends from "./VoterGuide/PositionListForFriends";
import TwitterActions from "../actions/TwitterActions";
import TwitterStore from "../stores/TwitterStore";
import UnknownTwitterAccount from "./VoterGuide/UnknownTwitterAccount";
import VoterStore from "../stores/VoterStore";

export default class TwitterHandleLanding extends Component {
  static propTypes = {
    active_route: PropTypes.string,
    params: PropTypes.object,
    location: PropTypes.object.isRequired,
  };

  constructor (props) {
    super(props);
    this.state = {
      twitter_handle: "",
    };
    this.getIncomingActiveRoute = this.getIncomingActiveRoute.bind(this);
  }

  componentDidMount () {
    // console.log("TwitterHandleLanding componentDidMount, this.props.params.twitter_handle: " + this.props.params.twitter_handle);
    this.setState({ twitter_handle: this.props.params.twitter_handle });
    TwitterActions.twitterIdentityRetrieve(this.props.params.twitter_handle);
    this.twitterStoreListener = TwitterStore.addListener(this._onTwitterStoreChange.bind(this));

    this._onVoterStoreChange();
    this.voterStoreListener = VoterStore.addListener(this._onVoterStoreChange.bind(this));
  }

  componentWillReceiveProps (nextProps) {
    // console.log("TwitterHandleLanding componentWillReceiveProps");
    if (nextProps.params.twitter_handle && this.state.twitter_handle.toLowerCase() !== nextProps.params.twitter_handle.toLowerCase()) {
      // We need this test to prevent an infinite loop
      // console.log("TwitterHandleLanding componentWillReceiveProps, different twitter_handle: ", nextProps.params.twitter_handle);
      TwitterActions.twitterIdentityRetrieve(nextProps.params.twitter_handle);
    }
  }

  componentWillUnmount () {
    this.twitterStoreListener.remove();
    this.voterStoreListener.remove();
  }

  _onTwitterStoreChange () {
    // console.log("TwitterHandleLanding _onTwitterStoreChange");
    let { kind_of_owner, owner_we_vote_id, twitter_handle, twitter_description, twitter_followers_count, twitter_name,
      twitter_photo_url, twitter_user_website,
      status } = TwitterStore.get();

    if (typeof twitter_followers_count !== "number") {
      twitter_followers_count = 0;
    }

    this.setState({
      kind_of_owner: kind_of_owner,
      owner_we_vote_id: owner_we_vote_id,
      twitter_handle: twitter_handle,
      twitter_description: twitter_description,
      twitter_followers_count: twitter_followers_count,
      twitter_name: twitter_name,
      twitter_photo_url: twitter_photo_url,
      twitter_user_website: twitter_user_website,
      status: status,
    });
  }

  _onVoterStoreChange () {
    // console.log("TwitterHandleLanding _onTwitterStoreChange");
    this.setState({ voter: VoterStore.getVoter() });
  }

  organizationCreateFromTwitter (new_twitter_handle) {
    // console.log("TwitterHandleLanding organizationCreateFromTwitter");
    OrganizationActions.saveFromTwitter(new_twitter_handle);
  }

  getIncomingActiveRoute () {
    let incoming_active_route = this.props.active_route || "";
    // console.log("TwitterHandleLanding, getIncomingActiveRoute incoming_active_route: ", incoming_active_route);
    return incoming_active_route;
  }

  render () {
    renderLog(__filename);
    if (this.state.status === undefined) {
      // console.log("TwitterHandleLanding this.state.status undefined");
      // Show a loading wheel while this component's data is loading
      return LoadingWheel;
    }

    const { voter, kind_of_owner, owner_we_vote_id, twitter_handle } = this.state;
    let signed_in_twitter = voter === undefined ? false : voter.signed_in_twitter;
    let signed_in_with_this_twitter_account = false;
    let looking_at_positions_for_friends_only = false;
    if (signed_in_twitter) {
      let twitter_handle_being_viewed = twitter_handle;  // Variable copied for code clarity
      // That is, you are looking at yourself
      signed_in_with_this_twitter_account = voter.twitter_screen_name === twitter_handle_being_viewed;

      // If we want to give people a way to only see the positions that are only visible to their friends, this is how
      looking_at_positions_for_friends_only = false;
    }

    // If signed_in_with_this_twitter_account AND not an ORGANIZATION or POLITICIAN, then create ORGANIZATION
    // We *may* eventually have a "VOTER" type, but for now ORGANIZATION is all we need for both orgs and voters
    let is_neither_organization_nor_politician = kind_of_owner !== "ORGANIZATION" && kind_of_owner !== "POLITICIAN";
    if (signed_in_with_this_twitter_account && is_neither_organization_nor_politician) {
      // We make the API call to create a new organization for this Twitter handle. This will create a cascade so that
      // js/routes/TwitterHandleLanding will switch the view to an Organization card / PositionList
      // console.log("TwitterHandleLanding, calling organizationCreateFromTwitter because is_neither_organization_nor_politician");
      this.organizationCreateFromTwitter(voter.twitter_screen_name);
    }

    // } else if (signed_in_with_this_twitter_account && voter_not_linked_to_organization) {
    //   // We (TODO DALE *should*) link the voter record to the organization with Twitter sign in -- this is for safety
    //   // TODO DALE 2016-10-30 Moving this to Twitter sign in
    //   // console.log("TwitterHandleLanding, calling organizationCreateFromTwitter because voter_not_linked_to_organization");
    //   // this.organizationCreateFromTwitter(voter.twitter_screen_name);
    // }

    if (this.state.kind_of_owner === "CANDIDATE") {
      this.props.params.candidate_we_vote_id = owner_we_vote_id;
      return <Candidate candidate_we_vote_id {...this.props} />;
    } else if (this.state.kind_of_owner === "ORGANIZATION"){
      this.props.params.organization_we_vote_id = owner_we_vote_id;
      if (looking_at_positions_for_friends_only) {
        return <PositionListForFriends we_vote_id {...this.props} />;
      } else {
        return <OrganizationVoterGuide {...this.props}
                                       location={this.props.location}
                                       params={this.props.params}
                                       active_route={this.getIncomingActiveRoute()} />;
      }
    } else if (this.state.kind_of_owner === "TWITTER_HANDLE_NOT_FOUND_IN_WE_VOTE"){
      // console.log("TwitterHandleLanding TWITTER_HANDLE_NOT_FOUND_IN_WE_VOTE calling UnknownTwitterAccount");
      return <UnknownTwitterAccount {...this.state} />;
    } else {
      // console.log("render in TwitterHandleLanding  else, this.state.kind_of_owner");
      return <div className="container-fluid well u-stack--md u-inset--md">
          <Helmet title="Not Found - We Vote" />
          <h3 className="h3">Claim Your Page</h3>
            <div className="medium">
              We were not able to find an account for this
              Twitter Handle{ this.state.twitter_handle ?
                <span> "{this.state.twitter_handle}"</span> :
                <span />}.
            </div>
            <br />
            <Link to="/twittersigninprocess/signinswitchstart">
              <Button variant="primary">Sign Into Twitter to Create Voter Guide</Button>
            </Link>
            <br />
            <br />
            <br />
        </div>;
    }
  }
}
