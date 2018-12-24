export interface IAnalyzedAudio {
  file: File;
  waveform: any;
  objectURL: any;
  bpm: any;
  tags: any;
  picture: any;
  complete: boolean;
  recentlyUploaded?: boolean;
  uploadTimeStamp?: number;
}

export interface IProcessingEvent {
  type: ProcessingSteps;
  payload: IAnalyzedAudio
}

export enum ProcessingSteps {
  FILE_CREATED,
  URL_CREATED,
  TAGS_CREATED,
  WAVEFORM_CREATED,
  BPM_CREATED,
  COMPLETED
}