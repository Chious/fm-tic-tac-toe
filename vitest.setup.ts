// Must be first: provides the JIT compiler for Angular components
import '@angular/compiler';

import { ɵresolveComponentResources as resolveComponentResources } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { beforeEach } from 'vitest';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

// Angular JIT registers component styleUrl/templateUrl resources lazily when each
// component class is first imported. Resolve them before every test so that
// TestBed.configureTestingModule() never encounters unresolved components.
const mockFetch = async () => ({ text: async () => '' }) as unknown as Response;
beforeEach(async () => {
  await resolveComponentResources(mockFetch);
});
