<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminLoginRequest;
use App\Http\Requests\AdminStoreRequest;
use App\Http\Requests\AdminUpdateRequest;
use App\Models\Admin;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class AdminController extends Controller
{
    public function __construct(private AdminService $adminService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            Log::info('Fetching all admins with pagination');
            
            $perPage = $request->get('per_page', 10);
            $page = $request->get('page', 1);
            
            $admins = $this->adminService->getAllAdminsPaginated($perPage, $page);

            if ($admins->isEmpty()) {
                Log::info('No admins found in the system');
                return response()->json([
                    'success' => true,
                    'message' => 'No admin accounts found in the system',
                    'data' => [],
                    'pagination' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => $perPage,
                        'total' => 0,
                        'from' => 0,
                        'to' => 0,
                        'first_page_url' => null,
                        'last_page_url' => null,
                        'next_page_url' => null,
                        'prev_page_url' => null,
                        'path' => $request->url()
                    ]
                ]);
            }

            Log::info('Successfully fetched admins with pagination', [
                'total' => $admins->total(),
                'per_page' => $admins->perPage(),
                'current_page' => $admins->currentPage()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin accounts retrieved successfully',
                'data' => $admins->items(),
                'pagination' => [
                    'current_page' => $admins->currentPage(),
                    'last_page' => $admins->lastPage(),
                    'per_page' => $admins->perPage(),
                    'total' => $admins->total(),
                    'from' => $admins->firstItem(),
                    'to' => $admins->lastItem(),
                    'first_page_url' => $admins->url(1),
                    'last_page_url' => $admins->url($admins->lastPage()),
                    'next_page_url' => $admins->nextPageUrl(),
                    'prev_page_url' => $admins->previousPageUrl(),
                    'path' => $request->url()
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching admin accounts: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Unable to retrieve admin accounts at the moment',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AdminStoreRequest $request): JsonResponse
    {
        try {
            Log::info('Creating new admin account', ['email' => $request->email]);

            $admin = $this->adminService->createAdmin($request->validated());

            Log::info('Admin account created successfully', [
                'admin_id' => $admin->id,
                'email' => $admin->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin account created successfully. New admin can now login to the system.',
                'data' => $admin
            ], 201);

        } catch (Exception $e) {
            Log::error('Error creating admin account: ' . $e->getMessage(), [
                'email' => $request->email
            ]);

            $errorMessage = 'Failed to create admin account';
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                $errorMessage = 'This email address is already registered in the system';
            }

            return response()->json([
                'success' => false,
                'message' => $errorMessage,
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            Log::info('Fetching admin account details', ['admin_id' => $id]);

            $admin = $this->adminService->findAdminById($id);

            if (!$admin) {
                Log::warning('Admin account not found', ['admin_id' => $id]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Admin account not found. The requested admin does not exist in the system.'
                ], 404);
            }

            Log::info('Admin account details retrieved successfully', ['admin_id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Admin account details retrieved successfully',
                'data' => $admin
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching admin account details: ' . $e->getMessage(), [
                'admin_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unable to retrieve admin account details at the moment',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AdminUpdateRequest $request, string $id): JsonResponse
    {
        try {
            Log::info('Updating admin account', ['admin_id' => $id]);

            $admin = $this->adminService->findAdminById($id);

            if (!$admin) {
                Log::warning('Admin account not found for update', ['admin_id' => $id]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Admin account not found. Cannot update non-existing account.'
                ], 404);
            }

            $updateData = $request->validated();
            
            Log::info('Update data received', [
                'admin_id' => $id,
                'update_data' => $updateData
            ]);

            $changes = [];
            
            if (isset($updateData['name']) && $updateData['name'] !== $admin->name) {
                $changes[] = 'name';
            }
            if (isset($updateData['email']) && $updateData['email'] !== $admin->email) {
                $changes[] = 'email';
            }
            if (isset($updateData['password'])) {
                $changes[] = 'password';
            }

            if (empty($changes)) {
                return response()->json([
                    'success' => true,
                    'message' => 'No changes detected. Admin account information remains the same.',
                    'data' => $admin
                ]);
            }

            $updatedAdmin = $this->adminService->updateAdmin($admin, $updateData);

            $updatedAdmin->refresh();

            Log::info('Admin account updated successfully', [
                'admin_id' => $id,
                'changes' => $changes,
                'new_data' => $updatedAdmin->toArray()
            ]);

            $changeMessage = 'Admin account updated successfully. ' . 
                           'Changes made: ' . implode(', ', $changes) . '.';

            return response()->json([
                'success' => true,
                'message' => $changeMessage,
                'data' => $updatedAdmin,
                'changes' => $changes
            ]);

        } catch (Exception $e) {
            Log::error('Error updating admin account: ' . $e->getMessage(), [
                'admin_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            $errorMessage = 'Failed to update admin account';
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                $errorMessage = 'This email address is already registered to another admin account';
            }

            return response()->json([
                'success' => false,
                'message' => $errorMessage,
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            Log::info('Attempting to delete admin account', ['admin_id' => $id]);

            $admin = $this->adminService->findAdminById($id);

            if (!$admin) {
                Log::warning('Admin account not found for deletion', ['admin_id' => $id]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Admin account not found. Cannot delete non-existing account.'
                ], 404);
            }

            $totalAdmins = Admin::count();
            if ($totalAdmins <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete the only admin account in the system. At least one admin account must remain.'
                ], 422);
            }

            $adminEmail = $admin->email;
            $this->adminService->deleteAdmin($admin);

            Log::info('Admin account deleted successfully', [
                'admin_id' => $id,
                'email' => $adminEmail
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin account deleted successfully. The admin can no longer access the system.'
            ]);

        } catch (Exception $e) {
            Log::error('Error deleting admin account: ' . $e->getMessage(), [
                'admin_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete admin account. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Admin login
     */
    public function login(AdminLoginRequest $request): JsonResponse
    {
        try {
            Log::info('Admin login attempt', ['email' => $request->email]);

            $result = $this->adminService->attemptLogin($request->validated());

            if (!$result['success']) {
                Log::warning('Admin login failed', [
                    'email' => $request->email,
                    'reason' => 'Invalid credentials'
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Login failed. Please check your email and password and try again.'
                ], 401);
            }

            Log::info('Admin login successful', [
                'admin_id' => $result['admin']->id,
                'email' => $request->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful! Welcome back, ' . $result['admin']->name . '!',
                'data' => [
                    'admin' => [
                        'id' => $result['admin']->id,
                        'name' => $result['admin']->name,
                        'email' => $result['admin']->email,
                    ],
                    'token' => $result['token']
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Login error: ' . $e->getMessage(), [
                'email' => $request->email
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Login service is temporarily unavailable. Please try again in a few moments.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Admin logout
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active session found. You are already logged out.'
                ], 401);
            }

            $admin = $request->user();
            $adminName = $admin->name;
            
            Log::info('Admin logout initiated', [
                'admin_id' => $admin->id,
                'email' => $admin->email
            ]);

            $request->user()->currentAccessToken()->delete();

            Log::info('Admin logout completed successfully', ['admin_id' => $admin->id]);

            return response()->json([
                'success' => true,
                'message' => 'Goodbye, ' . $adminName . '! You have been logged out successfully.'
            ]);

        } catch (Exception $e) {
            Log::error('Logout error: ' . $e->getMessage(), [
                'admin_id' => $request->user()->id ?? 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Logout failed due to technical issue. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get current admin profile
     */
    public function getProfile(Request $request): JsonResponse
    {
        try {
            $admin = $request->user();
            
            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin data not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'created_at' => $admin->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $admin->updated_at->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching admin profile: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error occurred while fetching admin information'
            ], 500);
        }
    }
}