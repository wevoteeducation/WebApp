import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import AnalyticsActions from "../../actions/AnalyticsActions";
import CandidateActions from "../../actions/CandidateActions";
import CandidateItem from "../../components/Ballot/CandidateItem";
import CandidateStore from "../../stores/CandidateStore";
import { capitalizeString } from "../../utils/textFormat";
import GuideList from "../../components/VoterGuide/GuideList";
import Helmet from "react-helmet";
import IssueActions from "../../actions/IssueActions";
import IssuesFollowedByBallotItemDisplayList from "../../components/Issues/IssuesFollowedByBallotItemDisplayList";
import IssueStore from "../../stores/IssueStore";
import LoadingWheel from "../../components/LoadingWheel";
import { renderLog } from "../../utils/logging";
import OpenExternalWebSite from "../../utils/OpenExternalWebSite";
import OrganizationActions from "../../actions/OrganizationActions";
import PositionList from "../../components/Ballot/PositionList";
import SupportActions from "../../actions/SupportActions";
import ThisIsMeAction from "../../components/Widgets/ThisIsMeAction";
import VoterGuideActions from "../../actions/VoterGuideActions";
import VoterGuideStore from "../../stores/VoterGuideStore";
import VoterStore from "../../stores/VoterStore";
import SearchAllActions from "../../actions/SearchAllActions";
import webAppConfig from "../../config";

// The component /routes/VoterGuide/OrganizationVoterGuideCandidate is based on this component
export default class Candidate extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  constructor (props) {
    super(props);
    this.state = {
      candidate: {},
      candidate_we_vote_id: "",
      organizationWeVoteId: "",
      position_list_from_advisers_followed_by_voter: [],

      // Eventually we could use this getVoterGuidesToFollowForBallotItemId with candidate_we_vote_id, but we can't now
      //  because we don't always have the ballot_item_we_vote_id for certain API calls like organizationFollow
      // guidesToFollowList: VoterGuideStore.getVoterGuidesToFollowForBallotItemId(this.props.params.candidate_we_vote_id)
      voter_guides_to_follow_for_latest_ballot_item: [],
      voter_guides_to_follow_for_this_ballot_item: [],
    };
  }

  componentDidMount () {
    // console.log("Candidate componentDidMount");
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));

    let organizationWeVoteId = "";
    if (this.props.params) {
      CandidateActions.candidateRetrieve(this.props.params.candidate_we_vote_id);
      CandidateActions.positionListForBallotItem(this.props.params.candidate_we_vote_id);

      organizationWeVoteId = this.props.params.organization_we_vote_id || "";
      // If needed, activate this
      // organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      // if (organizationWeVoteId && organizationWeVoteId !== "" && !organization.organization_we_vote_id) {
      //   // Retrieve the organization object
      //   OrganizationActions.organizationRetrieve(organizationWeVoteId);
      // }
    }

    if (IssueStore.getPreviousGoogleCivicElectionId() < 1) {
      IssueActions.issuesRetrieveForElection(VoterStore.election_id());
    }

    // Get the latest guides to follow for this candidate
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));

    // June 2018: Avoid hitting this same api multiple times, if we already have the data
    let voterGuidesForId = VoterGuideStore.getVoterGuideForOrganizationId(this.props.params.candidate_we_vote_id);
    if (voterGuidesForId && Object.keys(voterGuidesForId).length > 0) {
      VoterGuideActions.voterGuidesToFollowRetrieveByBallotItem(this.props.params.candidate_we_vote_id, "CANDIDATE");
    }

    // Make sure supportProps exist for this Candidate when browser comes straight to candidate page
    SupportActions.retrievePositionsCountsForOneBallotItem(this.props.params.candidate_we_vote_id);
    OrganizationActions.organizationsFollowedRetrieve();

    // We want to make sure we have all of the position information so that comments show up
    let voter_guides_to_follow_for_this_ballot_item = VoterGuideStore.getVoterGuidesToFollowForBallotItemId(this.props.params.candidate_we_vote_id);

    if (voter_guides_to_follow_for_this_ballot_item) {
      voter_guides_to_follow_for_this_ballot_item.forEach(one_voter_guide => {
        // console.log("one_voter_guide: ", one_voter_guide);
        OrganizationActions.positionListForOpinionMaker(one_voter_guide.organization_we_vote_id, false, true, one_voter_guide.google_civic_election_id);
      });

    }

    // Display the candidate's name in the search box
    let searchBoxText = this.state.candidate.ballot_item_display_name || "";  // TODO DALE Not working right now
    SearchAllActions.exitSearch(searchBoxText); // TODO: still not used :)
    AnalyticsActions.saveActionCandidate(VoterStore.election_id(), this.props.params.candidate_we_vote_id);
    this.setState({
      candidate_we_vote_id: this.props.params.candidate_we_vote_id,
      organizationWeVoteId: organizationWeVoteId,
      position_list_from_advisers_followed_by_voter: CandidateStore.getPositionList(this.props.params.candidate_we_vote_id),
      voter_guides_to_follow_for_latest_ballot_item: VoterGuideStore.getVoterGuidesToFollowForLatestBallotItem(),
      voter_guides_to_follow_for_this_ballot_item: voter_guides_to_follow_for_this_ballot_item,
    });
  }

  componentWillReceiveProps (nextProps) {
    // console.log("Candidate componentWillReceiveProps");
    // When a new candidate is passed in, update this component to show the new data
    if (nextProps.params.candidate_we_vote_id !== this.state.candidate_we_vote_id) {
      CandidateActions.candidateRetrieve(nextProps.params.candidate_we_vote_id);
      CandidateActions.positionListForBallotItem(nextProps.params.candidate_we_vote_id);
      VoterGuideActions.voterGuidesToFollowRetrieveByBallotItem(nextProps.params.candidate_we_vote_id, "CANDIDATE");
      this.setState({
        candidate_we_vote_id: nextProps.params.candidate_we_vote_id,
        position_list_from_advisers_followed_by_voter: CandidateStore.getPositionList(nextProps.params.candidate_we_vote_id),
        voter_guides_to_follow_for_latest_ballot_item: VoterGuideStore.getVoterGuidesToFollowForLatestBallotItem(),
        voter_guides_to_follow_for_this_ballot_item: VoterGuideStore.getVoterGuidesToFollowForBallotItemId(nextProps.params.candidate_we_vote_id),
      });
    }

    // Display the candidate's name in the search box
    // var { candidate } = this.state;
    // var searchBoxText = candidate.ballot_item_display_name || "";  // TODO DALE Not working right now
    SearchAllActions.exitSearch("");
  }

  componentWillUnmount () {
    // console.log("Candidate componentWillUnmount");
    this.candidateStoreListener.remove();
    this.voterGuideStoreListener.remove();
  }

  onCandidateStoreChange () {
    // console.log("Candidate onCandidateStoreChange");
    this.setState({
      candidate: CandidateStore.getCandidate(this.state.candidate_we_vote_id),
      position_list_from_advisers_followed_by_voter: CandidateStore.getPositionList(this.state.candidate_we_vote_id),
    });
  }

  onVoterGuideStoreChange () {
    // console.log("Candidate onVoterGuideStoreChange");
    // When the voter_guides_to_follow_for_latest_ballot_item changes, trigger an update of the candidate so we can get an updated position_list
    // CandidateActions.candidateRetrieve(this.state.candidate_we_vote_id);
    CandidateActions.positionListForBallotItem(this.state.candidate_we_vote_id);

    // Also update the position count for *just* this candidate, since it might not come back with positionsCountForAllBallotItems
    SupportActions.retrievePositionsCountsForOneBallotItem(this.state.candidate_we_vote_id);

    // Eventually we could use this getVoterGuidesToFollowForBallotItemId with candidate_we_vote_id, but we can't now
    //  because we don't always have the ballot_item_we_vote_id for certain API calls like organizationFollow
    this.setState({
      voter_guides_to_follow_for_latest_ballot_item: VoterGuideStore.getVoterGuidesToFollowForLatestBallotItem(),

      voter_guides_to_follow_for_this_ballot_item: VoterGuideStore.getVoterGuidesToFollowForBallotItemId(this.state.candidate_we_vote_id),
    });
  }

  render () {
    renderLog(__filename);
    const electionId = VoterStore.election_id();
    const NO_VOTER_GUIDES_TEXT = "We could not find any more voter guides to listen to related to this candidate.";

    // console.log("Candidate render, this.state.position_list_from_advisers_followed_by_voter: ", this.state.position_list_from_advisers_followed_by_voter);

    if (!this.state.candidate || !this.state.candidate.ballot_item_display_name) {
      // TODO DALE If the candidate we_vote_id is not valid, we need to update this with a notice
      return <div className="container-fluid well u-stack--md u-inset--md">
                <div>{LoadingWheel}</div>
                <br />
            </div>;
    }

    let candidateName = capitalizeString(this.state.candidate.ballot_item_display_name);
    let titleText = candidateName + " - We Vote";
    let descriptionText = "Information about " + candidateName + ", candidate for " + this.state.candidate.contest_office_name;
    let voter = VoterStore.getVoter();
    let candidateAdminEditUrl = webAppConfig.WE_VOTE_SERVER_ROOT_URL + "c/" + this.state.candidate.id + "/edit/?google_civic_election_id=" + VoterStore.election_id() + "&state_code=";

    return <span>
      <Helmet title={titleText}
              meta={[{ "name": "description", "content": descriptionText }]}
              />
      <section className="card">
        <CandidateItem {...this.state.candidate}
                       commentButtonHide
                       contest_office_name={this.state.candidate.contest_office_name}
                       organizationWeVoteId={this.state.organizationWeVoteId}
                       hideOpinionsToFollow
                       linkToOfficePage
                       position_list={this.state.position_list_from_advisers_followed_by_voter}
                       showLargeImage
                       showPositionsInYourNetworkBreakdown
                       showPositionStatementActionBar
        />
        <div className="card__additional">
          { this.state.position_list_from_advisers_followed_by_voter ?
            <div>
              <PositionList position_list={this.state.position_list_from_advisers_followed_by_voter}
                            hideSimpleSupportOrOppose
                            ballot_item_display_name={this.state.candidate.ballot_item_display_name}
                            positionListExistsTitle={<div><h3 className="card__additional-heading">{"Your Network's Opinions"}</h3></div>}/>
            </div> :
            null
          }
          {this.state.voter_guides_to_follow_for_this_ballot_item.length === 0 ?
            <div className="card__additional-text">{NO_VOTER_GUIDES_TEXT}</div> :
            <div><h3 className="card__additional-heading">{"More opinions about " + this.state.candidate.ballot_item_display_name}</h3>
            <GuideList id={electionId}
                       ballotItemWeVoteId={this.state.candidate_we_vote_id}
                       organizationsToFollow={this.state.voter_guides_to_follow_for_this_ballot_item}/></div>
          }
        </div>
        <div className="card__additional u-inset__squish--md">
          <IssuesFollowedByBallotItemDisplayList ballot_item_display_name={this.state.candidate.ballot_item_display_name}
                                                 ballotItemWeVoteId={this.state.candidate_we_vote_id}
                                                 overlayTriggerOnClickOnly />
        </div>
      </section>
      <OpenExternalWebSite url="https://api.wevoteusa.org/vg/create/"
                           className="opinions-followed__missing-org-link"
                           target="_blank"
                           title="Endorsements Missing?"
                           body={<Button className="u-margin-top--sm u-stack--xs" bsStyle="primary">Endorsements Missing?</Button>}
      />
      <div className="opinions-followed__missing-org-text u-no-break">
        Are there endorsements for {candidateName} that you expected to see?
      </div>
      <br />
      <ThisIsMeAction twitter_handle_being_viewed={this.state.candidate.twitter_handle}
                    name_being_viewed={this.state.candidate.ballot_item_display_name}
                    kind_of_owner="POLITICIAN" />
      <br />
    {/* Show links to this candidate in the admin tools */}
    { voter.is_admin || voter.is_verified_volunteer ?
      <span className="u-wrap-links hidden-print">Admin:
        <OpenExternalWebSite url={candidateAdminEditUrl}
                             target="_blank"
                             className="open-web-site open-web-site__no-right-padding"
                             body={<span>edit {candidateName}</span>} />
      </span> :
      null
    }
    </span>;
  }
}
