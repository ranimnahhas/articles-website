<?php

namespace App\Services;

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Database\QueryException;

class AdminService
{
    public function getAllAdmins()
    {
        try {
            return Admin::all();
        } catch (QueryException $e) {
            Log::error('Database error while fetching admins: ' . $e->getMessage());
            throw new Exception('Unable to retrieve admins from database');
        } catch (Exception $e) {
            Log::error('Unexpected error while fetching admins: ' . $e->getMessage());
            throw new Exception('Failed to retrieve admins');
        }
    }

    public function findAdminById(string $id): ?Admin
    {
        try {
            return Admin::find($id);
        } catch (QueryException $e) {
            Log::error('Database error while finding admin: ' . $e->getMessage(), ['admin_id' => $id]);
            throw new Exception('Unable to find admin in database');
        } catch (Exception $e) {
            Log::error('Unexpected error while finding admin: ' . $e->getMessage(), ['admin_id' => $id]);
            throw new Exception('Failed to find admin');
        }
    }

    public function createAdmin(array $data): Admin
    {
        try {
            return Admin::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);
        } catch (QueryException $e) {
            Log::error('Database error while creating admin: ' . $e->getMessage(), ['email' => $data['email']]);
            
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                throw new Exception('Email address already exists');
            }
            
            throw new Exception('Unable to create admin in database');
        } catch (Exception $e) {
            Log::error('Unexpected error while creating admin: ' . $e->getMessage(), ['email' => $data['email']]);
            throw new Exception('Failed to create admin account');
        }
    }

    public function updateAdmin(Admin $admin, array $data): Admin
    {
        try {
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $admin->update($data);
            return $admin->fresh(); // إرجاع البيانات المحدثة

        } catch (QueryException $e) {
            Log::error('Database error while updating admin: ' . $e->getMessage(), ['admin_id' => $admin->id]);
            
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                throw new Exception('Email address already exists');
            }
            
            throw new Exception('Unable to update admin in database');
        } catch (Exception $e) {
            Log::error('Unexpected error while updating admin: ' . $e->getMessage(), ['admin_id' => $admin->id]);
            throw new Exception('Failed to update admin account');
        }
    }

    public function deleteAdmin(Admin $admin): bool
    {
        try {
            return $admin->delete();
        } catch (QueryException $e) {
            Log::error('Database error while deleting admin: ' . $e->getMessage(), ['admin_id' => $admin->id]);
            throw new Exception('Unable to delete admin from database');
        } catch (Exception $e) {
            Log::error('Unexpected error while deleting admin: ' . $e->getMessage(), ['admin_id' => $admin->id]);
            throw new Exception('Failed to delete admin account');
        }
    }

    public function attemptLogin(array $credentials): array
    {
        try {
            Log::info('Login attempt', ['email' => $credentials['email']]);
            
            $admin = Admin::where('email', $credentials['email'])->first();

            if (!$admin || !Hash::check($credentials['password'], $admin->password)) {
                return [
                    'success' => false, 
                    'message' => 'Invalid credentials'
                ];
            }

            $token = $admin->createToken('admin-token')->plainTextToken;

            return [
                'success' => true,
                'admin' => $admin,
                'token' => $token
            ];

        } catch (Exception $e) {
            Log::error('Login service error: ' . $e->getMessage(), ['email' => $credentials['email']]);
            throw new Exception('Authentication service temporarily unavailable');
        }
    }
}