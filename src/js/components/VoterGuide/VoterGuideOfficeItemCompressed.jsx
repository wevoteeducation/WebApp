import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Modal } from "react-bootstrap";
import { cordovaDot, historyPush, hasIPhoneNotch } from "../../utils/cordovaUtils";
import TextTruncate from "react-text-truncate";
import { toTitleCase } from "../../utils/textFormat";
import AnalyticsActions from "../../actions/AnalyticsActions";
import BallotIntroFollowIssues from "../../components/Ballot/BallotIntroFollowIssues";
import BallotIntroFollowAdvisers from "../../components/Ballot/BallotIntroFollowAdvisers";
import BallotIntroVerifyAddress from "../../components/Ballot/BallotIntroVerifyAddress";
import BallotStore from "../../stores/BallotStore";
import BookmarkToggle from "../Bookmarks/BookmarkToggle";
import CandidateStore from "../../stores/CandidateStore";
import Icon from "react-svg-icons";
import ImageHandler from "../ImageHandler";
import IssueStore from "../../stores/IssueStore";
import ItemActionBar from "../Widgets/ItemActionBar";
import ItemPositionStatementActionBar from "../Widgets/ItemPositionStatementActionBar";
import ItemSupportOpposeRaccoon from "../Widgets/ItemSupportOpposeRaccoon";
import LearnMore from "../Widgets/LearnMore";
import { renderLog } from "../../utils/logging";
import OrganizationPositionItem from "./OrganizationPositionItem";
import OrganizationStore from "../../stores/OrganizationStore";
import Slider from "react-slick";
import SupportStore from "../../stores/SupportStore";
import VoterActions from "../../actions/VoterActions";
import VoterStore from "../../stores/VoterStore";
import VoterGuideStore from "../../stores/VoterGuideStore";

const NUMBER_OF_CANDIDATES_TO_DISPLAY = 30; // On voter guide pages, we want to show all

// This is based on components/Ballot/OfficeItemCompressed
export default class VoterGuideOfficeItemCompressed extends Component {
  static propTypes = {
    allBallotItemsCount: PropTypes.number,
    we_vote_id: PropTypes.string.isRequired,
    ballot_item_display_name: PropTypes.string.isRequired,
    candidate_list: PropTypes.array,
    currentBallotIdInUrl: PropTypes.string,
    kind_of_ballot_item: PropTypes.string.isRequired,
    link_to_ballot_item_page: PropTypes.bool,
    location: PropTypes.object,
    organization: PropTypes.object.isRequired,
    organization_we_vote_id: PropTypes.string.isRequired,
    toggleCandidateModal: PropTypes.func,
    updateOfficeDisplayUnfurledTracker: PropTypes.func,
    urlWithoutHash: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      candidateList: [],
      display_all_candidates_flag: false,
      display_office_unfurled: false,
      editMode: false,
      maximum_organization_display: 4,
      organization: {},
      showBallotIntroFollowIssues: false,
      show_position_statement: true,
      transitioning: false,
    };

    this.closeYourNetworkIsUndecidedPopover = this.closeYourNetworkIsUndecidedPopover.bind(this);
    this.closeYourNetworkSupportsPopover = this.closeYourNetworkSupportsPopover.bind(this);
    this.closeHighestIssueScorePopover = this.closeHighestIssueScorePopover.bind(this);
    this.getCandidateLink = this.getCandidateLink.bind(this);
    this.getOfficeLink = this.getOfficeLink.bind(this);
    this.goToCandidateLink = this.goToCandidateLink.bind(this);
    this.goToOfficeLink = this.goToOfficeLink.bind(this);
    this.openCandidateModal = this.openCandidateModal.bind(this);
    this._nextSliderPage = this._nextSliderPage.bind(this);
    this._toggleBallotIntroFollowIssues = this._toggleBallotIntroFollowIssues.bind(this);
    this.toggleDisplayAllCandidates = this.toggleDisplayAllCandidates.bind(this);
    this.toggleExpandDetails = this.toggleExpandDetails.bind(this);
  }

  componentDidMount () {
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.issueStoreListener = IssueStore.addListener(this.onIssueStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.supportStoreListener = SupportStore.addListener(this.onSupportStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.onVoterGuideStoreChange();
    this.onCandidateStoreChange();
    if (this.props.organization && this.props.organization.organization_we_vote_id) {
      this.setState({
        organization: this.props.organization,
      });
    }

    // If there three or fewer offices on this ballot, unfurl them
    if (this.props.allBallotItemsCount && this.props.allBallotItemsCount <= 3) {
      this.setState({
        display_office_unfurled: true,
      });
    } else {
      //read from BallotStore
      this.setState({
        display_office_unfurled: BallotStore.getBallotItemUnfurledStatus(this.props.we_vote_id),
      });
    }
  }

  componentWillReceiveProps (nextProps) {
    // console.log("officeItemCompressed componentWillReceiveProps, nextProps.candidate_list:", nextProps.candidate_list);
    // 2018-05-10 I don't think we need to trigger a new render because the incoming candidate_list should be the same
    // if (nextProps.candidate_list && nextProps.candidate_list.length) {
    //   this.setState({
    //     candidateList: nextProps.candidate_list,
    //   });
    // }

    // Only update organization if it is a different organization
    if (nextProps.organization && nextProps.organization.organization_we_vote_id && this.state.organization.organization_we_vote_id !== nextProps.organization.organization_we_vote_id) {
      this.setState({
        organization: OrganizationStore.getOrganizationByWeVoteId(nextProps.organization.organization_we_vote_id),
      });
    }
  }

  componentWillUnmount () {
    this.candidateStoreListener.remove();
    this.issueStoreListener.remove();
    this.organizationStoreListener.remove();
    this.supportStoreListener.remove();
    this.voterGuideStoreListener.remove();
  }

  onCandidateStoreChange () {
    if (this.props.candidate_list && this.props.candidate_list.length && this.props.we_vote_id) {
      // console.log("onCandidateStoreChange");
      let newCandidateList = [];
      this.props.candidate_list.forEach(candidate => {
        if (candidate && candidate.we_vote_id) {
          newCandidateList.push(CandidateStore.getCandidate(candidate.we_vote_id));
        }
      });
      this.setState({
        candidateList: newCandidateList,
      });
      // console.log(this.props.candidate_list);
    }
  }

  onIssueStoreChange () {
    this.setState({
      transitioning: false,
    });
  }

  onVoterGuideStoreChange () {
    this.setState({
      transitioning: false,
    });
  }

  onOrganizationStoreChange () {
    // console.log("VoterGuideOfficeItemCompressed onOrganizationStoreChange, org_we_vote_id: ", this.state.organization.organization_we_vote_id);
    this.setState({
      organization: OrganizationStore.getOrganizationByWeVoteId(this.state.organization.organization_we_vote_id),
    });
  }

  onSupportStoreChange () {
    // Whenever positions change, we want to make sure to get the latest organization, because it has
    //  position_list_for_one_election and position_list_for_all_except_one_election attached to it
    this.setState({
      organization: OrganizationStore.getOrganizationByWeVoteId(this.state.organization.organization_we_vote_id),
      transitioning: false,
    });
  }

  _toggleBallotIntroFollowIssues () {
    // VoterActions.voterUpdateRefresh(); // Grab the latest voter information which includes interface_status_flags
    if (!this.state.showBallotIntroFollowIssues) {
      AnalyticsActions.saveActionModalIssues(VoterStore.election_id());
    }

    this.setState({ showBallotIntroFollowIssues: !this.state.showBallotIntroFollowIssues });
  }

  _nextSliderPage () {
    VoterActions.voterUpdateRefresh(); // Grab the latest voter information which includes interface_status_flags
    this.refs.slider.slickNext();
  }

  toggleDisplayAllCandidates () {
    this.setState({ display_all_candidates_flag: !this.state.display_all_candidates_flag });
  }

  toggleExpandDetails (displayOfficeUnfurled) {
    const { we_vote_id: weVoteId, updateOfficeDisplayUnfurledTracker, urlWithoutHash, currentBallotIdInUrl } = this.props;
    // historyPush should be called only when current office Id (we_vote_id) is not currentBallotIdBeingShown in url.
    if (currentBallotIdInUrl !== weVoteId) {
      historyPush(urlWithoutHash + "#" + weVoteId);
    }

    if (typeof displayOfficeUnfurled === "boolean") {
      this.setState({ display_office_unfurled: displayOfficeUnfurled });
    } else {
      this.setState({ display_office_unfurled: !this.state.display_office_unfurled });
    }

    //only update tracker if there are more than 3 offices
    if (this.props.allBallotItemsCount && this.props.allBallotItemsCount > 3) {
      updateOfficeDisplayUnfurledTracker(weVoteId, !this.state.display_office_unfurled);
    }
    // console.log('toggling raccoon Details!');
  }

  openCandidateModal (candidate) {
    // console.log("this.state.candidate: ", this.state.candidate);
    if (candidate && candidate.we_vote_id) {
      this.props.toggleCandidateModal(candidate);
    }
  }

  getCandidateLink (candidateWeVoteId) {
    return "/candidate/" + candidateWeVoteId + "/btvg/" + this.state.organization.organization_we_vote_id;
  }

  getOfficeLink () {
    return "/office/" + this.props.we_vote_id + "/btvg/" + this.state.organization.organization_we_vote_id;
  }

  goToCandidateLink (candidateWeVoteId) {
    let candidateLink = this.getCandidateLink(candidateWeVoteId);
    historyPush(candidateLink);
  }

  goToOfficeLink () {
    let officeLink = this.getOfficeLink();
    historyPush(officeLink);
  }

  doesOrganizationHavePositionOnCandidate (candidateWeVoteId) {
    return OrganizationStore.doesOrganizationHavePositionOnCandidate(this.state.organization.organization_we_vote_id, candidateWeVoteId);
  }

  getOrganizationPositionForThisCandidate (candidateWeVoteId, position_list_for_one_election) {
    // console.log("getOrganizationPositionForThisCandidate position_list_for_one_election: ", position_list_for_one_election);
    let one_position_to_return = {};
    if (position_list_for_one_election) {
      position_list_for_one_election.forEach((one_position) => {
        // console.log("getOrganizationPositionForThisCandidate candidateWeVoteId: ", candidateWeVoteId, ", one_position: ", one_position);
        if (one_position.ballot_item_we_vote_id === candidateWeVoteId) {
          // console.log("getOrganizationPositionForThisCandidate one_position found to return");
          // Because this is a forEach, we aren't able to break out of the loop
          one_position_to_return = one_position;
        }
      });
    }

    return one_position_to_return;
  }

  closeYourNetworkSupportsPopover () {
    this.refs["supports-overlay"].hide();
  }

  closeHighestIssueScorePopover () {
    this.refs["highest-issue-score-overlay"].hide();
  }

  closeYourNetworkIsUndecidedPopover () {
    this.refs["undecided-overlay"].hide();
  }

  render () {
    // console.log("VoterGuideOfficeItemCompressed render");
    renderLog(__filename);
    let { ballot_item_display_name: ballotItemDisplayName, we_vote_id: weVoteId } = this.props;

    ballotItemDisplayName = toTitleCase(ballotItemDisplayName);
    let unsortedCandidateList = this.state.candidateList.slice(0);
    let totalNumberOfCandidatesToDisplay = this.state.candidateList.length;
    let remainingCandidatesToDisplayCount = 0;
    // let advisorsThatMakeVoterIssuesScoreDisplay;
    // let advisorsThatMakeVoterIssuesScoreCount = 0;
    // let advisorsThatMakeVoterNetworkScoreCount = 0;
    // let advisorsThatMakeVoterNetworkScoreDisplay = null;
    let arrayOfCandidatesVoterSupports = [];
    let atLeastOneCandidateChosenByNetwork = false;
    // let atLeastOneCandidateChosenByIssueScore = false;
    // let candidateWithMostSupportFromNetwork = null;
    // let candidateWeVoteWithMostSupportFromNetwork = null;
    // let candidateWithHighestIssueScore = null;
    // let candidateWeVoteIdWithHighestIssueScore = null;
    let voterSupportsAtLeastOneCandidate = false;
    let supportProps;
    let candidateHasVoterSupport;
    let voterIssuesScoreForCandidate;
    let sortedCandidateList;
    let limitedCandidateList;

    // Prepare an array of candidate names that are supported by voter
    unsortedCandidateList.forEach((candidate) => {
      supportProps = SupportStore.get(candidate.we_vote_id);
      if (supportProps) {
        candidateHasVoterSupport = supportProps.is_support;
        voterIssuesScoreForCandidate = IssueStore.getIssuesScoreByBallotItemWeVoteId(candidate.we_vote_id);
        candidate.voterNetworkScoreForCandidate = Math.abs(supportProps.support_count - supportProps.oppose_count);
        candidate.voterIssuesScoreForCandidate = Math.abs(voterIssuesScoreForCandidate);
        candidate.is_support = supportProps.is_support;
        if (candidateHasVoterSupport) {
          arrayOfCandidatesVoterSupports.push(candidate.ballot_item_display_name);
          voterSupportsAtLeastOneCandidate = true;
        }
      }
    });

    unsortedCandidateList.sort((optionA, optionB)=>optionB.voterNetworkScoreForCandidate - optionA.voterNetworkScoreForCandidate ||
                                                   (optionA.is_support === optionB.is_support ? 0 : optionA.is_support ? -1 : 1) ||
                                                   optionB.voterIssuesScoreForCandidate - optionA.voterIssuesScoreForCandidate);
    limitedCandidateList = unsortedCandidateList;
    sortedCandidateList = unsortedCandidateList;
    if (!this.state.display_all_candidates_flag && this.state.candidateList.length > NUMBER_OF_CANDIDATES_TO_DISPLAY) {
      limitedCandidateList = sortedCandidateList.slice(0, NUMBER_OF_CANDIDATES_TO_DISPLAY);
      remainingCandidatesToDisplayCount = this.state.candidateList.length - NUMBER_OF_CANDIDATES_TO_DISPLAY;
    }

    // If the voter isn't supporting any candidates, then figure out which candidate the voter's network likes the best
    if (arrayOfCandidatesVoterSupports.length === 0) {
      // This function finds the highest support count for each office but does not handle ties. If two candidates have
      // the same network support count, only the first candidate will be displayed.
      let largestNetworkSupportCount = 0;
      let networkSupportCount;
      let networkOpposeCount;

      sortedCandidateList.forEach((candidate) => {
        // Support in voter's network
        supportProps = SupportStore.get(candidate.we_vote_id);
        if (supportProps) {
          networkSupportCount = supportProps.support_count;
          networkOpposeCount = supportProps.oppose_count;

          if (networkSupportCount > networkOpposeCount) {
            if (networkSupportCount > largestNetworkSupportCount) {
              largestNetworkSupportCount = networkSupportCount;
              // candidateWithMostSupportFromNetwork = candidate.ballot_item_display_name;
              // candidateWeVoteWithMostSupportFromNetwork = candidate.we_vote_id;
              atLeastOneCandidateChosenByNetwork = true;
            }
          }
        }
        // Support based on Issue score
        // Not used in VoterGuideOfficeItemCompressed
      });
      // Candidate chosen by issue score
      // Not used in VoterGuideOfficeItemCompressed
    }

    let organization_position_for_this_candidate;
    let candidateWeVoteId;
    let candidateSupportStore;

    let sliderSettings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipe: true,
      accessibility: true,
      afterChange: this.afterChangeHandler,
      arrows: false,
    };
    // let candidatePreviewCount = 0;
    // let candidatePreviewLimit = 5;
    let candidatePreviewList = [];
    // let oneCandidateDisplay = <span />;
    const BallotIntroFollowIssuesModal = <Modal bsPrefix="background-brand-blue modal"
                                                id="ballotIntroFollowIssuesId"
                                                show={this.state.showBallotIntroFollowIssues}
                                                onHide={() => this._toggleBallotIntroFollowIssues(this)}>
        <Modal.Body>
          <div className="intro-modal__close">
            <a onClick={this._toggleBallotIntroFollowIssues} className={`intro-modal__close-anchor ${hasIPhoneNotch() ? "intro-modal__close-anchor-iphonex" : ""}`}>
              <img src={cordovaDot("/img/global/icons/x-close.png")} alt="close" />
            </a>
          </div>
          <Slider dotsClass="slick-dots intro-modal__gray-dots" className="calc-height intro-modal__height-full" ref="slider" {...sliderSettings}>
            <div className="intro-modal__height-full" key={1}><BallotIntroFollowIssues next={this._nextSliderPage}/></div>
            <div className="intro-modal__height-full" key={2}><BallotIntroFollowAdvisers next={this._nextSliderPage}/></div>
            <div className="intro-modal__height-full" key={3}><BallotIntroVerifyAddress next={this._toggleBallotIntroFollowIssues} manualFocus={this.state.current_page_index === 2} /></div>
          </Slider>
        </Modal.Body>
      </Modal>;

    return <div className="card-main office-item">
      { BallotIntroFollowIssuesModal }
      <a className="anchor-under-header" name={weVoteId} />
      <div className="card-main__content">
        {/* Desktop */}
        <span className="d-none d-sm-block">
          <BookmarkToggle we_vote_id={weVoteId} type="OFFICE" />
        </span>

        {/* On the voter guide, we bring the size of the office name down so we can emphasize the candidate being supported */}
        <h2 className="h4 u-f5 card-main__ballot-name u-gray-dark u-stack--sm">
          <span className="u-cursor--pointer" onClick={this.toggleExpandDetails}>
            { this.state.display_office_unfurled ?
              <span className="d-print-none u-push--xs"><Icon name="glyphicons-pro-halflings/glyphicons-halflings-252-triangle-bottom" width={32} height={32} color="" /></span> :
              null
            }
            {ballotItemDisplayName}
          </span>
        </h2>

        {/* *************************
        Only show the candidates if the Office is "unfurled"
        ************************* */}
        { this.state.display_office_unfurled ?
          <span>{limitedCandidateList.map((oneCandidate) => {

            if (!oneCandidate || !oneCandidate.we_vote_id) { return null; }

            candidateWeVoteId = oneCandidate.we_vote_id;
            candidateSupportStore = SupportStore.get(candidateWeVoteId);
            let organizationsToFollowSupport = VoterGuideStore.getVoterGuidesToFollowForBallotItemIdSupports(candidateWeVoteId);
            let organizationsToFollowOppose = VoterGuideStore.getVoterGuidesToFollowForBallotItemIdOpposes(candidateWeVoteId);
            let candidatePartyText = oneCandidate.party && oneCandidate.party.length ? oneCandidate.party + ". " : "";
            let candidate_description_text = oneCandidate.twitter_description && oneCandidate.twitter_description.length ? oneCandidate.twitter_description : "";
            let candidate_text = candidatePartyText + candidate_description_text;

            organization_position_for_this_candidate = this.getOrganizationPositionForThisCandidate(candidateWeVoteId, this.state.organization.position_list_for_one_election);

            return <div key={candidateWeVoteId} className="u-stack--md">
              <div className="o-media-object u-flex-auto u-min-50 u-push--sm u-stack--sm">
                {/* Candidate Photo, only shown in Desktop */}
                {this.state.display_office_unfurled ?
                  <div className="d-none d-sm-block" onClick={this.props.link_to_ballot_item_page ? this.toggleExpandDetails : null}>
                    <ImageHandler className="card-main__avatar-compressed o-media-object__anchor u-cursor--pointer u-self-start u-push--sm"
                                  sizeClassName="icon-candidate-small u-push--sm "
                                  imageUrl={oneCandidate.candidate_photo_url_large}
                                  alt="candidate-photo"
                                  kind_of_ballot_item="CANDIDATE" />
                  </div> :
                  null
                }
                <div className="o-media-object__body u-flex u-flex-column u-flex-auto u-justify-between">
                  {/* Candidate Name */}
                  <h4 className={"card-main__candidate-name" + (this.doesOrganizationHavePositionOnCandidate(candidateWeVoteId) ? " u-f2" : " u-f6")}>
                    <a onClick={this.props.link_to_ballot_item_page ? () => this.goToCandidateLink(oneCandidate.we_vote_id) : null}>
                      <TextTruncate line={1}
                                    truncateText="…"
                                    text={oneCandidate.ballot_item_display_name}
                                    textTruncateChild={null}/>
                    </a>
                  </h4>
                  {/* Description under candidate name */}
                  <LearnMore text_to_display={candidate_text}
                             on_click={this.props.link_to_ballot_item_page ? () => this.goToCandidateLink(oneCandidate.we_vote_id) : null} />

                  {/* Organization Endorsement */}
                  { this.doesOrganizationHavePositionOnCandidate(candidateWeVoteId) && organization_position_for_this_candidate ?
                    <OrganizationPositionItem key={organization_position_for_this_candidate.position_we_vote_id}
                                              position={organization_position_for_this_candidate}
                                              organization={this.state.organization}
                                              editMode={this.state.editMode}
                                              turnOffLogo
                                              turnOffName
                             /> :
                    null }

                  {/* Organization's Followed AND to Follow Items -- only show for promoted candidate(s) */}
                  { this.doesOrganizationHavePositionOnCandidate(candidateWeVoteId) ?
                    <div>
                      <div className="u-flex u-flex-auto u-flex-row u-justify-between u-items-center u-min-50">
                        {/* Positions in Your Network and Possible Voter Guides to Follow */}
                        <ItemSupportOpposeRaccoon ballotItemWeVoteId={candidateWeVoteId}
                                                  ballot_item_display_name={oneCandidate.ballot_item_display_name}
                                                  currentBallotIdInUrl={this.props.location.hash.slice(1)}
                                                  display_raccoon_details_flag={this.state.display_office_unfurled}
                                                  goToCandidate={() => this.goToCandidateLink(oneCandidate.we_vote_id)}
                                                  maximumOrganizationDisplay={this.state.maximum_organization_display}
                                                  organizationsToFollowSupport={organizationsToFollowSupport}
                                                  organizationsToFollowOppose={organizationsToFollowOppose}
                                                  popoverBottom
                                                  supportProps={candidateSupportStore}
                                                  type="CANDIDATE"
                                                  urlWithoutHash={this.props.location.pathname + this.props.location.search}
                                                  we_vote_id={this.props.we_vote_id} />
                      </div>
                    </div> :
                    null}
                </div>
              </div>
            </div>;
          })}</span> :
          null
        }

        {/* *************************
        If the office is "rolled up", show some details for the organization's endorsement
        ************************* */}
        { !this.state.display_office_unfurled ?
          <div>
            { this.state.candidateList.map(oneCandidate => {
                if (!oneCandidate || !oneCandidate.we_vote_id) {
                  return null;
                }

                if (this.doesOrganizationHavePositionOnCandidate(oneCandidate.we_vote_id) ) {
                  organization_position_for_this_candidate = this.getOrganizationPositionForThisCandidate(oneCandidate.we_vote_id, this.state.organization.position_list_for_one_election);

                  if (organization_position_for_this_candidate) {
                    candidateWeVoteId = oneCandidate.we_vote_id;
                    candidateSupportStore = SupportStore.get(candidateWeVoteId);

                    let is_support = false;
                    let is_oppose = false;
                    let voter_statement_text = false;
                    if (candidateSupportStore !== undefined) {
                      is_support = candidateSupportStore.is_support;
                      is_oppose = candidateSupportStore.is_oppose;
                      voter_statement_text = candidateSupportStore.voter_statement_text;
                    }

                    return <div key={candidateWeVoteId}>
                      {/* Organization Endorsement */}
                      <OrganizationPositionItem ballotItemLink={this.getCandidateLink(candidateWeVoteId)}
                                                key={organization_position_for_this_candidate.position_we_vote_id}
                                                position={organization_position_for_this_candidate}
                                                organization={this.state.organization}
                                                editMode={this.state.editMode}
                      />
                      <div className="flex">
                          <ItemActionBar ballot_item_display_name={oneCandidate.ballot_item_display_name}
                                         ballot_item_we_vote_id={candidateWeVoteId}
                                         commentButtonHide
                                         currentBallotIdInUrl={this.props.location.hash.slice(1)}
                                         shareButtonHide
                                         supportProps={candidateSupportStore}
                                         transitioning={this.state.transitioning}
                                         type="CANDIDATE"
                                         urlWithoutHash={this.props.location.pathname + this.props.location.search}
                                         we_vote_id={this.props.we_vote_id}
                                         />
                      </div>
                      {/* DESKTOP: If voter has taken position, offer the comment bar */}
                      {is_support || is_oppose || voter_statement_text ?
                        <div className="d-none d-sm-block o-media-object u-flex-auto u-min-50 u-push--sm u-stack--sm">
                          <div
                            className="card-main__avatar-compressed o-media-object__anchor u-cursor--pointer u-self-start u-push--sm">&nbsp;
                          </div>
                          <div className="o-media-object__body u-flex u-flex-column u-flex-auto u-justify-between">
                            <ItemPositionStatementActionBar ballot_item_display_name={oneCandidate.ballot_item_display_name}
                                                            ballot_item_we_vote_id={candidateWeVoteId}
                                                            supportProps={candidateSupportStore}
                                                            transitioning={this.state.transitioning}
                                                            type="CANDIDATE"
                                                            shown_in_list/>
                          </div>
                        </div> :
                        null }
                      {/* MOBILE: If voter has taken position, offer the comment bar */}
                      {is_support || is_oppose || voter_statement_text ?
                        <div className="d-block d-sm-none o-media-object u-flex-auto u-min-50 u-push--sm u-stack--sm">
                          <div
                            className="card-main__avatar-compressed o-media-object__anchor u-cursor--pointer u-self-start u-push--sm">&nbsp;
                          </div>
                          <div className="o-media-object__body u-flex u-flex-column u-flex-auto u-justify-between">
                            <ItemPositionStatementActionBar ballot_item_display_name={oneCandidate.ballot_item_display_name}
                                                            ballot_item_we_vote_id={candidateWeVoteId}
                                                            supportProps={candidateSupportStore}
                                                            transitioning={this.state.transitioning}
                                                            type="CANDIDATE"
                                                            shown_in_list/>
                          </div>
                        </div> :
                        null }
                    </div>;
                  }
                }
                return null;
              })
            }
            {/* Now that we are out of the candidate loop we want to add option if a candidate isn't suggested
                by network or issues. */}
            { voterSupportsAtLeastOneCandidate ?
              null :
              <span>
                { atLeastOneCandidateChosenByNetwork ?
                  null :
                  <div>
                    <span onClick={this.toggleExpandDetails}>
                      { candidatePreviewList }
                    </span>
                    <div className="u-tr d-print-none">
                      <Link onClick={this._toggleBallotIntroFollowIssues}>
                        <span className=" u-cursor--pointer">Follow issues or organizations for advice <i className="fa fa-info-circle fa-md network-positions-stacked__info-icon-for-popover hidden-print" aria-hidden="true" /></span>
                      </Link>
                    </div>
                  </div>
                }
              </span>
            }
          </div> :
          null
        } {/* End of "!this.state.display_office_unfurled ?", yes, a 200 line if clause */}

        { !this.state.display_all_candidates_flag && this.state.display_office_unfurled && remainingCandidatesToDisplayCount ?
          <Link onClick={this.toggleDisplayAllCandidates}>
            <span className="u-items-center u-no-break d-print-none">
              <i className="fa fa-plus BallotItem__view-more-plus" aria-hidden="true" />
              <span> Show {remainingCandidatesToDisplayCount} more candidate{ remainingCandidatesToDisplayCount !== 1 ? "s" : null }</span>
            </span>
          </Link> : null
        }
        {/* this.state.display_all_candidates_flag && this.state.candidateList.length > NUMBER_OF_CANDIDATES_TO_DISPLAY ?
          <BallotSideBarLink url={"#" + this.props.we_vote_id}
                             label={"Click to show fewer candidates..."}
                             displaySubtitles={false}
                             onClick={this.toggleDisplayAllCandidates} /> : null
        */}
        { this.state.display_office_unfurled ?
          <Link onClick={this.toggleExpandDetails}>
            <span className="BallotItem__view-more u-items-center pull-right u-no-break d-print-none">
              show fewer</span>
          </Link> :
          <Link onClick={this.toggleExpandDetails}>
            <div className="BallotItem__view-more u-items-center u-no-break d-print-none">
              <i className="fa fa-plus BallotItem__view-more-plus" aria-hidden="true" />
              { totalNumberOfCandidatesToDisplay > 1 ?
                <span> View all {totalNumberOfCandidatesToDisplay} candidates</span> :
                <span> View candidate</span>
              }
            </div>
          </Link>
        }
        </div>
    </div>;
  }
}
