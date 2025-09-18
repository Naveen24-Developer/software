import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, createCustomer } from '@/lib/db/queries';
import { getAllCustomers } from '@/lib/data/customer';

export async function GET() {
  try {
    const customers = await getAllCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customer = await createCustomer(body);
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}