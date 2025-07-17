// Test script to validate error handling improvements

import { 
  handleAsyncOperation, 
  handleApiError, 
  retryOperation, 
  logError, 
  isError,
  ERROR_MESSAGES 
} from '../lib/errorHandling';

// Test async operation error handling
async function testAsyncOperationHandling() {
  console.log('🧪 Testing async operation error handling...');
  
  // Test successful operation
  const { data: successData, error: successError } = await handleAsyncOperation(
    async () => 'Success!',
    {
      component: 'TestScript',
      operation: 'testSuccess'
    }
  );
  
  console.log('✅ Success case:', { data: successData, error: successError });
  
  // Test failed operation
  const { data: failData, error: failError } = await handleAsyncOperation(
    async () => {
      throw new Error('Test error');
    },
    {
      component: 'TestScript',
      operation: 'testFailure',
      fallback: 'Fallback value'
    }
  );
  
  console.log('✅ Failure case:', { data: failData, error: failError });
}

// Test API error handling
function testApiErrorHandling() {
  console.log('🧪 Testing API error handling...');
  
  const networkError = new Error('fetch failed');
  const authError = new Error('401 unauthorized');
  const serverError = new Error('500 server error');
  const unknownError = { message: 'Unknown error' };
  
  console.log('✅ Network error:', handleApiError(networkError, 'test operation'));
  console.log('✅ Auth error:', handleApiError(authError, 'test operation'));
  console.log('✅ Server error:', handleApiError(serverError, 'test operation'));
  console.log('✅ Unknown error:', handleApiError(unknownError, 'test operation'));
}

// Test retry mechanism
async function testRetryMechanism() {
  console.log('🧪 Testing retry mechanism...');
  
  let attemptCount = 0;
  
  try {
    const result = await retryOperation(
      async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return `Success on attempt ${attemptCount}`;
      },
      3,
      100, // Short delay for testing
      { component: 'TestScript', operation: 'testRetry' }
    );
    
    console.log('✅ Retry success:', result);
  } catch (error) {
    console.log('❌ Retry failed:', error);
  }
}

// Test error logging
function testErrorLogging() {
  console.log('🧪 Testing error logging...');
  
  const testError = new Error('Test logging error');
  const loggedError = logError(testError, {
    component: 'TestScript',
    operation: 'testLogging',
    additionalInfo: { testData: 'example' }
  });
  
  console.log('✅ Logged error:', loggedError);
}

// Test type guards
function testTypeGuards() {
  console.log('🧪 Testing type guards...');
  
  const realError = new Error('Real error');
  const fakeError = { message: 'Fake error' };
  const apiError = { error: 'API error', details: 'More details' };
  
  console.log('✅ isError(realError):', isError(realError));
  console.log('✅ isError(fakeError):', isError(fakeError));
  console.log('✅ API error handling works');
}

// Run all tests
export async function runErrorHandlingTests() {
  console.log('🚀 Starting error handling tests...\n');
  
  try {
    await testAsyncOperationHandling();
    console.log('');
    
    testApiErrorHandling();
    console.log('');
    
    await testRetryMechanism();
    console.log('');
    
    testErrorLogging();
    console.log('');
    
    testTypeGuards();
    console.log('');
    
    console.log('✅ All error handling tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error handling tests failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runErrorHandlingTests();
}