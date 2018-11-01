import React, { Component } from "react";
import PropTypes from "prop-types";
import { OverlayTrigger, Popover } from "react-bootstrap";
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
import IssuesByBallotItemDisplayList from "../../components/Issues/IssuesByBallotItemDisplayList";
import IssueStore from "../../stores/IssueStore";
import ItemSupportOpposeRaccoon from "../Widgets/ItemSupportOpposeRaccoon";
import LearnMore from "../Widgets/LearnMore";
import { renderLog } from "../../utils/logging";
import OrganizationStore from "../../stores/OrganizationStore";
import Slider from "react-slick";
import SupportStore from "../../stores/SupportStore";
import VoterActions from "../../actions/VoterActions";
import VoterStore from "../../stores/VoterStore";
import VoterGuideStore from "../../stores/VoterGuideStore";

const NUMBER_OF_CANDIDATES_TO_DISPLAY = 5;

// This is related to components/VoterGuide/VoterGuideOfficeItemCompressed
export default class OfficeItemCompressedRaccoon extends Component {
  static propTypes = {
    allBallotItemsCount: PropTypes.number,
    we_vote_id: PropTypes.string.isRequired,
    ballot_item_display_name: PropTypes.string.isRequired,
    candidate_list: PropTypes.array,
    currentBallotIdInUrl: PropTypes.string,
    kind_of_ballot_item: PropTypes.string.isRequired,
    link_to_ballot_item_page: PropTypes.bool,
    organization: PropTypes.object,
    organization_we_vote_id: PropTypes.string,
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
    VoterActions.voterUpdateRefresh(); // Grab the latest voter information which includes interface_status_flags
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
    if (this.state.organization && this.state.organization.organization_we_vote_id) {
      // If there is an organization_we_vote_id, signal that we want to link back to voter_guide for that organization
      return "/candidate/" + candidateWeVoteId + "/btvg/" + this.state.organization.organization_we_vote_id;
    } else {
      // If no organization_we_vote_id, signal that we want to link back to default ballot
      return "/candidate/" + candidateWeVoteId + "/b/btdb/";
    }
  }

  getOfficeLink () {
    if (this.state.organization && this.state.organization.organization_we_vote_id) {
      // If there is an organization_we_vote_id, signal that we want to link back to voter_guide for that organization
      return "/office/" + this.props.we_vote_id + "/btvg/" + this.state.organization.organization_we_vote_id;
    } else {
      // If no organization_we_vote_id, signal that we want to link back to default ballot
      return "/office/" + this.props.we_vote_id + "/b/btdb/";
    }
  }

  goToCandidateLink (candidateWeVoteId) {
    let candidateLink = this.getCandidateLink(candidateWeVoteId);
    historyPush(candidateLink);
  }

  goToOfficeLink () {
    let officeLink = this.getOfficeLink();
    historyPush(officeLink);
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
    // console.log("OfficeItemCompressedRaccoon render");
    renderLog(__filename);
    let { ballot_item_display_name: ballotItemDisplayName, we_vote_id: weVoteId } = this.props;

    ballotItemDisplayName = toTitleCase(ballotItemDisplayName);
    let unsortedCandidateList = this.state.candidateList.slice(0);
    let totalNumberOfCandidatesToDisplay = this.state.candidateList.length;
    let remainingCandidatesToDisplayCount = 0;
    let advisorsThatMakeVoterIssuesScoreDisplay;
    // let advisorsThatMakeVoterIssuesScoreCount = 0;
    let advisorsThatMakeVoterNetworkScoreCount = 0;
    let advisorsThatMakeVoterNetworkScoreDisplay = null;
    let arrayOfCandidatesVoterSupports = [];
    let atLeastOneCandidateChosenByNetwork = false;
    let atLeastOneCandidateChosenByIssueScore = false;
    let candidateWithMostSupportFromNetwork = null;
    let candidateWeVoteWithMostSupportFromNetwork = null;
    let candidateWithHighestIssueScore = null;
    let candidateWeVoteIdWithHighestIssueScore = null;
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
      let largestIssueScore = 0;
      sortedCandidateList.forEach((candidate) => {
        // Support in voter's network
        supportProps = SupportStore.get(candidate.we_vote_id);
        if (supportProps) {
          networkSupportCount = supportProps.support_count;
          networkOpposeCount = supportProps.oppose_count;

          if (networkSupportCount > networkOpposeCount) {
            if (networkSupportCount > largestNetworkSupportCount) {
              largestNetworkSupportCount = networkSupportCount;
              candidateWithMostSupportFromNetwork = candidate.ballot_item_display_name;
              candidateWeVoteWithMostSupportFromNetwork = candidate.we_vote_id;
              atLeastOneCandidateChosenByNetwork = true;
            }
          }
        }
        // Support based on Issue score
        if (voterIssuesScoreForCandidate > largestIssueScore) {
          largestIssueScore = voterIssuesScoreForCandidate;
          candidateWithHighestIssueScore = candidate.ballot_item_display_name;
          candidateWeVoteIdWithHighestIssueScore = candidate.we_vote_id;
          atLeastOneCandidateChosenByIssueScore = true;
        }
      });
      // Candidate chosen by issue score
      if (atLeastOneCandidateChosenByIssueScore) {
        // If there are issues the voter is following, we should attempt to to create a list of orgs that support or oppose this ballot item
        let organizationNameIssueSupportList = IssueStore.getOrganizationNameSupportListUnderThisBallotItem(candidateWeVoteIdWithHighestIssueScore);
        let organizationNameIssueSupportListDisplay =
          organizationNameIssueSupportList.map(organizationName => <span key={organizationName} className="u-flex u-flex-row u-justify-start u-items-start">
            <img src={cordovaDot("/img/global/icons/thumbs-up-color-icon.svg")} width="20" height="20" />
            <span>&nbsp;</span>
            <span>{organizationName} <strong>+1</strong></span>
          </span>);
        let organizationNameIssueOpposeList = IssueStore.getOrganizationNameOpposeListUnderThisBallotItem(candidateWeVoteIdWithHighestIssueScore);
        let organizationNameIssueOpposeListDisplay =
          organizationNameIssueOpposeList.map(organizationName => <span key={organizationName} className="u-flex u-flex-row u-justify-start u-items-start">
            <img src={cordovaDot("/img/global/icons/thumbs-down-color-icon.svg")} width="20" height="20" />
            <span>&nbsp;</span>
            <span>{organizationName}<strong>-1</strong></span>
          </span>);
        advisorsThatMakeVoterIssuesScoreDisplay = <span>
          { organizationNameIssueSupportList.length ? <span>{organizationNameIssueSupportListDisplay}</span> : null}
          { organizationNameIssueOpposeList.length ? <span>{organizationNameIssueOpposeListDisplay}</span> : null}
        </span>;
        // advisorsThatMakeVoterIssuesScoreCount = organizationNameIssueSupportList.length + organizationNameIssueOpposeList.length;
      }

      if (candidateWeVoteWithMostSupportFromNetwork) {
        // If there are issues the voter is following, we should attempt to to create a list of orgs that support or oppose this ballot item
        let nameNetworkSupportList = SupportStore.getNameSupportListUnderThisBallotItem(candidateWeVoteWithMostSupportFromNetwork);
        let nameNetworkSupportListDisplay =
          nameNetworkSupportList.map(speakerDisplayName => <span key={speakerDisplayName} className="u-flex u-flex-row u-justify-start u-items-start">
            <img src={cordovaDot("/img/global/icons/thumbs-up-color-icon.svg")} width="20" height="20" />
            <span>&nbsp;</span>
            <span>{speakerDisplayName} <strong>+1</strong></span>
          </span>);
        let nameNetworkOpposeList = SupportStore.getNameOpposeListUnderThisBallotItem(candidateWeVoteWithMostSupportFromNetwork);
        let nameNetworkOpposeListDisplay =
          nameNetworkOpposeList.map(speakerDisplayName => <span key={speakerDisplayName} className="u-flex u-flex-row u-justify-start u-items-start">
            <img src={cordovaDot("/img/global/icons/thumbs-down-color-icon.svg")} width="20" height="20" />
            <span>&nbsp;</span>
            <span>{speakerDisplayName} <strong>-1</strong></span>
          </span>);
        advisorsThatMakeVoterNetworkScoreDisplay = <span>
          { nameNetworkSupportList.length ? <span>{nameNetworkSupportListDisplay}</span> : null}
          { nameNetworkOpposeList.length ? <span>{nameNetworkOpposeListDisplay}</span> : null}
        </span>;
        advisorsThatMakeVoterNetworkScoreCount = nameNetworkSupportList.length + nameNetworkOpposeList.length;
      }
    }

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
    let candidatePreviewCount = 0;
    let candidatePreviewLimit = 5;
    let candidatePreviewList = [];
    let oneCandidateDisplay = <span />;
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

        <h2 className="u-f3 card-main__ballot-name u-gray-dark u-stack--sm">
          <span className="u-cursor--pointer" onClick={this.toggleExpandDetails}>
            {/* October 2018:  The bootstrap glyphicon has been eliminated in bootstrap 4, this line won't work */}
            { this.state.display_office_unfurled ?
              <span className="d-print-none u-push--xs"><Icon name="glyphicons-pro-halflings/glyphicons-halflings-252-triangle-bottom" width={32} height={32} color="" /></span> :
              <span className="d-print-none u-push--xs"><Icon name="glyphicons-pro-halflings/glyphicons-halflings-250-triangle-right" width={32} height={32} color="" /></span>
            }
            <span className="card-main__ballot-name-link">{ballotItemDisplayName}</span>
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

            let positionsDisplayRaccoon = <div>
              <div className="u-flex u-flex-auto u-flex-row u-justify-between u-items-center u-min-50">
                {/* Positions in Your Network and Possible Voter Guides to Follow */}
                <ItemSupportOpposeRaccoon ballotItemWeVoteId={candidateWeVoteId}
                                          ballot_item_display_name={oneCandidate.ballot_item_display_name}
                                          currentBallotIdInUrl={this.props.currentBallotIdInUrl}
                                          display_raccoon_details_flag={this.state.display_office_unfurled}
                                          goToCandidate={() => this.goToCandidateLink(oneCandidate.we_vote_id)}
                                          maximumOrganizationDisplay={this.state.maximum_organization_display}
                                          organizationsToFollowSupport={organizationsToFollowSupport}
                                          organizationsToFollowOppose={organizationsToFollowOppose}
                                          popoverBottom
                                          supportProps={candidateSupportStore}
                                          type="CANDIDATE"
                                          urlWithoutHash={this.props.urlWithoutHash}
                                          we_vote_id={this.props.we_vote_id}
                                          />
              </div>
            </div>;

            return <div key={candidateWeVoteId} className="u-stack--md u-gray-border-bottom">
              <div className="o-media-object u-flex-auto u-min-50 u-push--sm u-stack--sm">
                {/* Candidate Photo */}
                <div onClick={this.props.link_to_ballot_item_page ? () => this.goToCandidateLink(oneCandidate.we_vote_id) : null}>
                  <ImageHandler className="card-main__avatar-compressed o-media-object__anchor u-cursor--pointer u-self-start u-push--sm"
                                sizeClassName="icon-candidate-small u-push--sm "
                                imageUrl={oneCandidate.candidate_photo_url_large}
                                alt="candidate-photo"
                                kind_of_ballot_item="CANDIDATE" />
                </div>
                <div className="o-media-object__body u-flex u-flex-column u-flex-auto u-justify-between">
                  {/* Candidate Name */}
                  <h4 className="card-main__candidate-name card-main__candidate-name-link u-f5">
                    <a onClick={this.props.link_to_ballot_item_page ? () => this.goToCandidateLink(oneCandidate.we_vote_id) : null}>
                      <TextTruncate line={1}
                                    truncateText="…"
                                    text={oneCandidate.ballot_item_display_name}
                                    textTruncateChild={null}/>
                    </a>
                  </h4>
                  {/* Description under candidate name */}
                  <LearnMore on_click={this.props.link_to_ballot_item_page ? () => this.goToCandidateLink(oneCandidate.we_vote_id) : null}
                             num_of_lines={3}
                             text_to_display={candidatePartyText}
                             always_show_external_link
                             learn_more_text={"Learn more"}
                             />
                  {/* DESKTOP: If voter has taken position, offer the comment bar */}
                  {/* comment_display_raccoon_desktop */}
                  {/* Organization's Followed AND to Follow Items */}
                  {positionsDisplayRaccoon}
                </div>
                {/* MOBILE: If voter has taken position, offer the comment bar */}
                {/* comment_display_raccoon_mobile */}
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

                const voterSupportsThisCandidate = SupportStore.get(oneCandidate.we_vote_id) && SupportStore.get(oneCandidate.we_vote_id).is_support;
                let candidatePartyText = oneCandidate.party && oneCandidate.party.length ? oneCandidate.party + ". " : "";

                let networkOrIssueScoreSupport;
                if (atLeastOneCandidateChosenByNetwork) {
                  let yourNetworkSupportsPopover;
                  if (advisorsThatMakeVoterNetworkScoreCount > 0) {
                    // console.log("OfficeItemCompressedRaccoon - Generate yourNetworkSupportsPopover 1");
                    yourNetworkSupportsPopover =
                    <Popover id="popover-positioned-right"
                             title={<span>Your Network Supports <span className="fa fa-times pull-right u-cursor--pointer" aria-hidden="true" /></span>}
                             onClick={this.closeYourNetworkSupportsPopover}>
                      <strong>{oneCandidate.ballot_item_display_name}</strong> has
                      the highest <strong>Score in Your Network</strong>, based on these friends and organizations:<br />
                      {advisorsThatMakeVoterNetworkScoreDisplay}
                    </Popover>;
                  } else {
                    // console.log("OfficeItemCompressedRaccoon - Generate yourNetworkSupportsPopover 2");
                    yourNetworkSupportsPopover =
                      <Popover id="popover-positioned-right"
                               title={<span>Your Network Supports <span className="fa fa-times pull-right u-cursor--pointer" aria-hidden="true" /></span>}
                               onClick={this.closeYourNetworkSupportsPopover}>
                        Your friends, and the organizations you listen to, are <strong>Your Network</strong>.
                        Everyone in your network
                        that <span className="u-no-break"> <img src={cordovaDot("/img/global/icons/thumbs-up-color-icon.svg")} width="20" height="20" /> supports</span> {oneCandidate.ballot_item_display_name} adds
                        +1 to {oneCandidate.ballot_item_display_name}'s <strong>Score in Your Network</strong>. <strong>{oneCandidate.ballot_item_display_name}</strong> has
                        the highest score in your network.
                      </Popover>;
                  }

                  // console.log("OfficeItemCompressedRaccoon - networkOrIssueScoreSupport");
                  // Your network supports
                  networkOrIssueScoreSupport = candidateWithMostSupportFromNetwork === oneCandidate.ballot_item_display_name ?
                    <div className="u-flex u-items-center">
                    <div className="o-media-object u-flex-auto u-min-50 u-push--sm u-stack--sm u-cursor--pointer"
                         onClick={ this.props.link_to_ballot_item_page ?
                                   this.toggleExpandDetails : null }>
                      {/* Candidate Image */}
                      <ImageHandler className="card-main__avatar-compressed o-media-object__anchor u-cursor--pointer u-self-start u-push--sm"
                                    sizeClassName="icon-candidate-small u-push--sm "
                                    imageUrl={oneCandidate.candidate_photo_url_large}
                                    alt="candidate-photo"
                                    kind_of_ballot_item="CANDIDATE" />
                      {/* Candidate Name */}
                      <div className="o-media-object__body u-flex u-flex-column u-flex-auto u-justify-between">
                        <h2 className="card-main__candidate-name-link h5">
                          {oneCandidate.ballot_item_display_name}
                          <span className="u-margin-left--sm card-main__candidate-party-description">{candidatePartyText}</span>
                        </h2>
                      </div>
                    </div>
                    <div className="u-flex-none u-justify-end">
                      <OverlayTrigger trigger="click"
                                      ref="supports-overlay"
                                      onExit={this.closeYourNetworkSupportsPopover}
                                      rootClose
                                      placement="top"
                                      overlay={yourNetworkSupportsPopover}>
                        <div>
                          <span className="u-push--xs u-cursor--pointer">Your network supports</span>
                          <img src={cordovaDot("/img/global/icons/up-arrow-color-icon.svg")} className="network-positions__support-icon" width="20" height="20" />
                        </div>
                      </OverlayTrigger>
                    </div>
                  </div> : null;
                } else if (atLeastOneCandidateChosenByIssueScore) {
                  if (candidateWithHighestIssueScore === oneCandidate.ballot_item_display_name) {
                    // console.log("OfficeItemCompressedRaccoon - atLeastOneCandidateChosenByIssueScore");
                    const hasHighestIssueScorePopover =
                      <Popover id="popover-positioned-right"
                               title={<span>Highest Issue Score <span className="fa fa-times pull-right u-cursor--pointer" aria-hidden="true" /></span>}
                               onClick={this.closeHighestIssueScorePopover}>
                        We took the issues you are following, and added up the opinions of all of the organizations
                        under those issues. <strong>{oneCandidate.ballot_item_display_name}</strong> has
                        the most support from these
                        organizations.<br />
                        {advisorsThatMakeVoterIssuesScoreDisplay}
                        <Link onClick={this.toggleExpandDetails}> learn more</Link>
                      </Popover>;

                    networkOrIssueScoreSupport = <div className="u-flex u-items-center">
                      <div className="o-media-object u-flex-auto u-min-50 u-push--sm u-stack--sm u-cursor--pointer"
                           onClick={ this.props.link_to_ballot_item_page ?
                                     this.toggleExpandDetails : null }>
                        {/* Candidate Image */}
                        <ImageHandler className="card-main__avatar-compressed o-media-object__anchor u-cursor--pointer u-self-start u-push--sm"
                                      sizeClassName="icon-candidate-small u-push--sm "
                                      imageUrl={oneCandidate.candidate_photo_url_large}
                                      alt="candidate-photo"
                                      kind_of_ballot_item="CANDIDATE" />
                        {/* Candidate Name */}
                        <div className="o-media-object__body u-flex u-flex-column u-flex-auto u-justify-between">
                          <h2 className="card-main__candidate-name-link h5">
                            {oneCandidate.ballot_item_display_name}
                            <span className="u-margin-left--sm card-main__candidate-party-description">{candidatePartyText}</span>
                          </h2>
                          <div>
                            <OverlayTrigger trigger="click"
                                            ref="highest-issue-score-overlay"
                                            onExit={this.closeHighestIssueScorePopover}
                                            rootClose
                                            placement="top"
                                            overlay={hasHighestIssueScorePopover}>
                              <div>
                                <span className="u-push--xs u-cursor--pointer">Has the highest <strong>Issue Score</strong></span>
                                <img src={cordovaDot("/img/global/icons/up-arrow-color-icon.svg")}
                                     className="network-positions__support-icon" width="20" height="20"/>
                              </div>
                            </OverlayTrigger>
                          </div>
                        </div>
                      </div>
                    </div>;
                  }
                  /* END OF if (atLeastOneCandidateChosenByNetwork) / else if (atLeastOneCandidateChosenByIssueScore) */
                } else {
                  // If here, candidate was not chosen by Network or Issue so we add them to a preview list
                  // If at the end the candidates, none were chosen by voter, by network, or by issue, we use this
                  // preview list.
                  candidatePreviewCount += 1;
                  if (candidatePreviewCount <= candidatePreviewLimit) {
                    oneCandidateDisplay = <div key={ "candidate_preview-" + oneCandidate.we_vote_id } className="u-stack--md u-gray-border-bottom">
                      <div className="o-media-object u-flex-auto u-min-50 u-push--sm u-stack--sm u-cursor--pointer">
                        {/* Candidate Image */}
                        <ImageHandler className="card-main__avatar-compressed o-media-object__anchor u-cursor--pointer u-self-start u-push--sm"
                                      sizeClassName="icon-candidate-small u-push--sm "
                                      imageUrl={oneCandidate.candidate_photo_url_large}
                                      alt="candidate-photo"
                                      kind_of_ballot_item="CANDIDATE" />
                        {/* Candidate Name */}
                        <div className="o-media-object__body u-flex u-flex-column u-flex-auto u-justify-between">
                          <h4 className="card-main__candidate-name card-main__candidate-name-link u-f5">
                            {oneCandidate.ballot_item_display_name}
                            <span className="u-margin-left--sm card-main__candidate-party-description">{candidatePartyText}</span>
                          </h4>
                          <div>
                            {/* Issues related to this Candidate */}
                            <IssuesByBallotItemDisplayList ballotItemDisplayName={oneCandidate.ballot_item_display_name}
                                                           ballotItemWeVoteId={oneCandidate.we_vote_id}
                                                           currentBallotIdInUrl={this.props.currentBallotIdInUrl}
                                                           overlayTriggerOnClickOnly
                                                           placement={"bottom"}
                                                           urlWithoutHash={this.props.urlWithoutHash}
                                                           />
                          </div>
                        </div>
                      </div>
                    </div>;
                    candidatePreviewList.push(oneCandidateDisplay);
                  }
                }

                return <div key={oneCandidate.we_vote_id}>
                  {/* *** Candidate name *** */}
                  { voterSupportsThisCandidate ?
                    <div className="u-flex u-items-center">
                      <div className="o-media-object u-flex-auto u-cursor--pointer u-stack--sm" onClick={ this.props.link_to_ballot_item_page ?
                      this.toggleExpandDetails : null }>
                        {/* Candidate Image */}
                        <ImageHandler className="card-main__avatar-compressed o-media-object__anchor u-cursor--pointer u-self-start u-push--sm"
                                      sizeClassName="icon-candidate-small u-push--sm "
                                      imageUrl={oneCandidate.candidate_photo_url_large}
                                      alt="candidate-photo"
                                      kind_of_ballot_item="CANDIDATE" />
                        {/* Candidate Name */}
                        <div className="u-flex-auto u-justify-between">
                          <h2 className="h5 candidate-h2">
                          {oneCandidate.ballot_item_display_name}
                          </h2>
                        </div>
                      </div>

                      <div className="u-flex-none u-justify-end">
                        <span className="u-push--xs">Supported by you</span>
                        <img src={cordovaDot("/img/global/svg-icons/thumbs-up-color-icon.svg")} width="24" height="24" />
                      </div>
                    </div> :
                    <span>{ networkOrIssueScoreSupport }</span>
                  }
                  {/* *** "Positions in your Network" bar OR items you can follow *** */}
                </div>;
              })}
            {/* Now that we are out of the candidate loop we want to add option if a candidate isn't suggested
                by network or issues. */}
            { voterSupportsAtLeastOneCandidate ?
              null :
              <span>
                { atLeastOneCandidateChosenByNetwork || atLeastOneCandidateChosenByIssueScore ?
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
        { this.state.display_office_unfurled ?
          <Link onClick={this.toggleExpandDetails}>
            <span className="BallotItem__view-more u-items-center pull-right u-no-break d-print-none">
              Show less detail</span>
          </Link> :
          <Link onClick={this.toggleExpandDetails}>
            <div className="BallotItem__view-more u-items-center u-no-break d-print-none">
              <i className="fa fa-plus BallotItem__view-more-plus" aria-hidden="true" />
              { totalNumberOfCandidatesToDisplay > NUMBER_OF_CANDIDATES_TO_DISPLAY ?
                <span> View all {totalNumberOfCandidatesToDisplay} candidates</span> :
                <span> Show more detail</span>
              }
            </div>
          </Link>
        }
        </div>
    </div>;
  }
}
