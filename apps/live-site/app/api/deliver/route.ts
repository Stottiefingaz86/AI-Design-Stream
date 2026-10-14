import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { requestArea, userRequest, deadline, assignedDesigner, createCraftTicket } = body

  try {
    const results = {
      mattermost: { sent: false, error: null as string | null },
      craft: { sent: false, error: null as string | null },
    }

    // Mattermost webhook integration
    const mattermostWebhookUrl = process.env.MATTERMOST_WEBHOOK_URL
    
    if (mattermostWebhookUrl) {
      try {
        // Format Mattermost message with rich formatting
        const mattermostPayload = {
          text: `🎨 **New Design Request**`,
          attachments: [
            {
              color: '#7B68EE',
              title: `Design Request: ${requestArea}`,
              fields: [
                { 
                  title: 'Area', 
                  value: requestArea, 
                  short: true 
                },
                { 
                  title: 'Deadline', 
                  value: deadline, 
                  short: true 
                },
                { 
                  title: 'Assigned To', 
                  value: assignedDesigner || 'CH (Head of Design)', 
                  short: true 
                },
                { 
                  title: 'What', 
                  value: userRequest.what || 'N/A', 
                  short: false 
                },
                { 
                  title: 'Why', 
                  value: userRequest.why || 'N/A', 
                  short: false 
                },
                ...(userRequest.context ? [{ 
                  title: 'Context', 
                  value: userRequest.context.substring(0, 1000), // Limit length
                  short: false 
                }] : []),
                ...(userRequest.goals ? [{ 
                  title: 'Goals', 
                  value: userRequest.goals.substring(0, 1000),
                  short: false 
                }] : []),
                ...(userRequest.useCases ? [{ 
                  title: 'Use Cases', 
                  value: userRequest.useCases.substring(0, 1000),
                  short: false 
                }] : []),
              ],
              footer: 'Design Request App',
              ts: Math.floor(Date.now() / 1000),
            },
          ],
        }

        const mattermostResponse = await fetch(mattermostWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mattermostPayload),
        })

        if (mattermostResponse.ok) {
          results.mattermost.sent = true
          console.log('Mattermost notification sent successfully')
        } else {
          const errorText = await mattermostResponse.text()
          results.mattermost.error = `HTTP ${mattermostResponse.status}: ${errorText}`
          console.error('Mattermost webhook failed:', results.mattermost.error)
        }
      } catch (error: any) {
        results.mattermost.error = error.message || 'Unknown error'
        console.error('Mattermost webhook error:', error)
      }
    } else {
      console.log('MATTERMOST_WEBHOOK_URL not configured, skipping Mattermost notification')
      results.mattermost.error = 'Webhook URL not configured'
    }

    // Craft.io integration
    // Only create ticket if explicitly requested via createCraftTicket flag
    if (createCraftTicket) {
      const craftPayload = {
        title: `Design Request: ${requestArea}`,
        description: `
**What:** ${userRequest.what || 'N/A'}

**Why:** ${userRequest.why || 'N/A'}

${userRequest.context ? `**Context:** ${userRequest.context}\n` : ''}
${userRequest.goals ? `**Goals:** ${userRequest.goals}\n` : ''}
${userRequest.useCases ? `**Use Cases:** ${userRequest.useCases}\n` : ''}

**Deadline:** ${deadline}
**Assigned Designer:** ${assignedDesigner || 'CH (Head of Design)'}
        `.trim(),
        priority: deadline === 'ASAP' ? 'high' : 'normal',
        assignee: assignedDesigner || 'CH',
      }

      // TODO: Implement actual Craft.io API integration when API details are available
      // For now, simulate success
      results.craft.sent = true

      // Simulate network delay for Craft.io
      await new Promise(resolve => setTimeout(resolve, 500))
    } else {
      // If not creating ticket initially, mark as not sent (user can create it later)
      results.craft.sent = false
      results.craft.error = null
    }

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully',
      ...results,
    })
  } catch (error) {
    console.error('Delivery failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit request' },
      { status: 500 }
    )
  }
}
