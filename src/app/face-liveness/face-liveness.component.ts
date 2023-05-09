import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LivenessService } from './liveness.service';
import * as AWS from 'aws-sdk';
import { FaceLivenessReactWrapperComponent } from 'src/FaceLivenessReactWrapperComponent';
import awsmobile from 'src/aws-exports';

@Component({
  selector: 'app-face-liveness',
  templateUrl: './face-liveness.component.html',
  styleUrls: ['./face-liveness.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FaceLivenessComponent implements OnInit {

  public counter = 21;

  start_liveness_session = false;
  liveness_session_complete = false;
  session_id = null;
  is_live = false;
  confidence = 0;
  face_live_message = 'Loading ...'

  @ViewChild('faceliveness', { static: false }) faceliveness: FaceLivenessReactWrapperComponent;

  constructor(private faceLivenessService: LivenessService) {

  }

  ngOnInit(): void {
    this.faceLivenessService.liveness_session.subscribe(([status, data]) => {
      if (status == 'success') {
        this.initate_liveness_session(data);
      }
    })

    AWS.config.region = awsmobile['aws_project_region'];
    const cognito_endpoint = `cognito-idp.${awsmobile['aws_project_region']}.amazonaws.com/${awsmobile['aws_user_pools_id']}`
    // Initialize the Amazon Cognito credentials provider
    const session = this.faceLivenessService.get_current_session().then(data => {
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsmobile['aws_cognito_identity_pool_id'],
        Logins: {
          [cognito_endpoint]: data.getIdToken().getJwtToken()
        }
      });

      this.get_liveness_session()
    }).catch(err => {
      console.log(err)
    }
    );
  }

  public handleErrors(err: any) {
    this.liveness_session_complete = true;
    this.start_liveness_session = false;
    this.face_live_message = 'Error  during liveness detection'
    this.is_live = false;
    // Force remove the ReactDOM
    this.faceliveness.ngOnDestroy();
  }

  public handleLivenessAnalysisResults(data: any) {
    console.log(data);
    if (data['Confidence'] > 80) {
      this.is_live = true;
      this.face_live_message = `Liveness check passed, Confidence ${Math.round(Number(data['Confidence']))}`
    } else {
      this.is_live = false;
      this.face_live_message = `Liveness check failed, Confidence ${Math.round(Number(data['Confidence']))}`
    }
    this.liveness_session_complete = true;
    this.start_liveness_session = false;
    // Force remove the ReactDOM
    this.faceliveness.ngOnDestroy();
  }

  initate_liveness_session(data: {}) {
    this.is_live = false;
    this.session_id = data['SessionId'];
    this.confidence = 0;
    this.liveness_session_complete = false;
    setTimeout(() => {
      this.start_liveness_session = true;
    }, 3);
  }

  get_liveness_session() {
    this.start_liveness_session = false;
    this.faceLivenessService.get_face_liveness_session();
  }

}
